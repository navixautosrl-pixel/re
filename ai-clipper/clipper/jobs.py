"""Coada de lucrări: o singură lucrare rulează la un moment dat (procesare secvențială pe CPU),
cu progres, timp estimat și anulare. Interfața citește starea prin API, deci poate fi
închisă sau reîncărcată fără să oprească lucrarea."""

from __future__ import annotations

import collections
import logging
import threading
import time
import traceback
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable

from .tools import Cancelled, ToolError

log = logging.getLogger("clipper")

KIND_LABELS = {
    "download": "Import video",
    "transcribe": "Transcriere",
    "render": "Export clipuri",
}


@dataclass
class Job:
    id: str
    project_id: str
    kind: str
    status: str = "queued"          # queued | running | done | error | cancelled
    progress: float = 0.0
    message: str = "În așteptare…"
    error: str | None = None
    created: float = field(default_factory=time.time)
    started: float | None = None
    finished: float | None = None
    cancel_requested: bool = False
    fn: Callable[[Callable[[float, str], None]], Any] | None = field(default=None, repr=False)

    def public(self) -> dict:
        eta = None
        if self.status == "running" and self.started and self.progress > 0.03:
            elapsed = time.time() - self.started
            eta = max(0.0, elapsed / self.progress * (1 - self.progress))
        return {
            "id": self.id, "project_id": self.project_id, "kind": self.kind,
            "label": KIND_LABELS.get(self.kind, self.kind), "status": self.status,
            "progress": round(self.progress, 4), "message": self.message, "error": self.error,
            "eta_seconds": None if eta is None else round(eta), "cancel_requested": self.cancel_requested,
            "elapsed_seconds": round((self.finished or time.time()) - self.started) if self.started else 0,
        }


class JobManager:
    def __init__(self) -> None:
        self._jobs: dict[str, Job] = {}
        self._queue: collections.deque[str] = collections.deque()
        self._cv = threading.Condition()
        self._stop = False
        self._worker = threading.Thread(target=self._run, name="clipper-worker", daemon=True)
        self._worker.start()

    # ------------------------------------------------------------ API public
    def submit(self, project_id: str, kind: str, fn: Callable[[Callable[[float, str], None]], Any]) -> Job:
        with self._cv:
            if self.active_for(project_id):
                raise ToolError("Proiectul are deja o lucrare în curs. Așteaptă să se termine sau anuleaz-o.")
            job = Job(id=uuid.uuid4().hex[:12], project_id=project_id, kind=kind, fn=fn)
            self._jobs[job.id] = job
            self._queue.append(job.id)
            if len(self._queue) > 1 or self.running():
                job.message = "În coadă: așteaptă terminarea lucrării curente."
            self._cv.notify()
            return job

    def get(self, job_id: str) -> Job | None:
        return self._jobs.get(job_id)

    def cancel(self, job_id: str) -> Job:
        with self._cv:
            job = self._jobs.get(job_id)
            if not job:
                raise ToolError("Lucrare inexistentă.")
            if job.status == "queued":
                self._queue.remove(job.id)
                job.status, job.message, job.finished = "cancelled", "Anulată înainte de pornire.", time.time()
            elif job.status == "running":
                job.cancel_requested = True
                job.message = "Se anulează…"
            return job

    def active_for(self, project_id: str) -> Job | None:
        for job in self._jobs.values():
            if job.project_id == project_id and job.status in ("queued", "running"):
                return job
        return None

    def last_for(self, project_id: str) -> Job | None:
        jobs = [j for j in self._jobs.values() if j.project_id == project_id]
        return max(jobs, key=lambda j: j.created) if jobs else None

    def running(self) -> Job | None:
        return next((j for j in self._jobs.values() if j.status == "running"), None)

    def busy(self) -> bool:
        return bool(self._queue) or self.running() is not None

    def shutdown(self) -> None:
        with self._cv:
            self._stop = True
            for job in self._jobs.values():
                if job.status == "running":
                    job.cancel_requested = True
            self._cv.notify_all()

    # ------------------------------------------------------------ worker
    def _run(self) -> None:
        while True:
            with self._cv:
                while not self._queue and not self._stop:
                    self._cv.wait()
                if self._stop:
                    return
                job = self._jobs[self._queue.popleft()]
                job.status, job.started, job.message = "running", time.time(), "Pornire…"

            def progress(frac: float, msg: str, job=job) -> None:
                if job.cancel_requested:
                    raise Cancelled()
                job.progress = max(0.0, min(float(frac), 1.0))
                job.message = msg

            try:
                assert job.fn is not None
                job.fn(progress)
                job.status, job.progress, job.message = "done", 1.0, "Gata."
            except Cancelled:
                job.status, job.message = "cancelled", "Anulată. Poți relua oricând."
            except ToolError as exc:
                job.status, job.error, job.message = "error", str(exc), "Eroare."
                log.warning("Lucrarea %s (%s) a eșuat: %s", job.id, job.kind, exc)
            except Exception as exc:  # noqa: BLE001 - orice eroare trebuie să ajungă în interfață
                job.status, job.error, job.message = "error", f"Eroare neașteptată: {exc}", "Eroare."
                log.error("Lucrarea %s (%s) a eșuat:\n%s", job.id, job.kind, traceback.format_exc())
            finally:
                job.finished = time.time()
                job.fn = None
