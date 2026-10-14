import { useEffect, useState } from "react";
import { Facebook, Instagram } from "lucide-react";
import { LatestPost, fetchLatestPosts } from "@/lib/checkin";
import { SOCIAL_URLS } from "@/lib/social";

// The newest photos from the auto-posting job, so the homepage stays fresh
// without a redeploy. Hidden entirely if there's nothing (or the API is down).
const LatestPosts = () => {
  const [posts, setPosts] = useState<LatestPost[]>([]);

  useEffect(() => {
    fetchLatestPosts()
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50" id="latest-section">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Latest from our day</h2>
          <p className="text-lg text-slate-500">Follow us on Instagram and Facebook, and share our page with families looking for care.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {posts.map((post) => (
            <a
              key={post.id}
              href={SOCIAL_URLS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              // An odd last card is hidden on the 2-column layout so there's no empty gap.
              className="group odd:last:hidden lg:odd:last:block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              <img
                src={post.photoUrl}
                alt={post.caption.split("\n")[0]}
                loading="lazy"
                width={800}
                height={800}
                className="w-full aspect-square object-cover group-hover:scale-[1.02] transition-transform"
              />
              <div className="p-2.5 md:p-4">
                <p className="text-xs md:text-sm text-slate-600 line-clamp-3">{post.caption}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="flex justify-center gap-3 mt-10">
          <a
            href={SOCIAL_URLS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold text-white bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90"
          >
            <Instagram className="w-5 h-5" /> Instagram
          </a>
          <a
            href={SOCIAL_URLS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold text-white bg-[#1877F2] hover:opacity-90"
          >
            <Facebook className="w-5 h-5" /> Facebook
          </a>
        </div>
      </div>
    </section>
  );
};

export default LatestPosts;
