import Hero from "@/components/Hero";
import About from "@/components/About";
import Programs from "@/components/Programs";
import Pricing from "@/components/Pricing";
import PhotoGallery from "@/components/PhotoGallery";
import LatestPosts from "@/components/LatestPosts";
import Contact from "@/components/Contact";
import Header from "@/components/Header";
import { usePageMeta } from "@/hooks/use-page-meta";


const Index = () => {
  usePageMeta({
    title: "Daycare in San Ramon | Aama Daycare - Safe, Loving Childcare Near You",
    description:
      "Aama Daycare is a state-licensed daycare in San Ramon, CA, offering safe, reliable, and loving childcare for infants, toddlers, and preschoolers. Serving San Ramon, Dublin, Danville, and Pleasanton.",
    path: "/",
  });

  return (
    <>
      <header>
        <Header />
      </header>
      <main className="min-h-screen">
        <Hero />
        <About />
        <Programs />
        <Pricing />
        <PhotoGallery />
        <LatestPosts />
<Contact />
      </main>
      {/* Footer is added in index.html for global SEO NAP */}
    </>
  );
};

export default Index;
