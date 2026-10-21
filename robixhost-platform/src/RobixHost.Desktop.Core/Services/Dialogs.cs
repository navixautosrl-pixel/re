namespace RobixHost.Desktop.Services;

public enum ToastKind { Info, Success, Warning, Error }

/// <summary>Implemented by the WPF shell; faked in tests. View-models never touch UI types.</summary>
public interface IDialogService
{
    /// <summary>Ask the user to confirm. <paramref name="destructive"/> styles the confirm button as dangerous.</summary>
    Task<bool> ConfirmAsync(string title, string message, string confirmLabel, bool destructive);
    /// <summary>The user must type <paramref name="expectedText"/> exactly to proceed (irreversible actions).</summary>
    Task<bool> ConfirmByTypingAsync(string title, string message, string expectedText);
    void Toast(ToastKind kind, string message);
}
