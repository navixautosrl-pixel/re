import { Hero } from "@/components/sections/Hero";
import { QuickIntro } from "@/components/sections/QuickIntro";
import { PadelExperience } from "@/components/sections/PadelExperience";
import { PingPongBiliard } from "@/components/sections/PingPongBiliard";
import { TheLounge } from "@/components/sections/TheLounge";
import { WhyRiviera } from "@/components/sections/WhyRiviera";
import { SocialCommunity } from "@/components/sections/SocialCommunity";
import { Gallery } from "@/components/sections/Gallery";
import { GoogleRating } from "@/components/sections/GoogleRating";
import { Location } from "@/components/sections/Location";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <QuickIntro />
      <PadelExperience />
      <PingPongBiliard />
      <TheLounge />
      <WhyRiviera />
      <SocialCommunity />
      <Gallery />
      <GoogleRating />
      <Location />
      <FAQ />
      <Contact />
      <FinalCTA />
    </>
  );
}
