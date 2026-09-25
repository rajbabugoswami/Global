import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Users, Globe, Lock, PlusSquare, Image as ImageIcon, Video, Link2, MessageSquare, Heart, Share2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import AdBanner from "@/components/ads/AdBanner";

export default async function GroupFeedPage({ params }: { params: { groupId: string } }) {
  const group = await prisma.group.findUnique({
    where: { id: params.groupId },
    include: {
      _count: {
        select: { members: true, posts: true }
      },
      posts: {
        include: {
          author: true,
          _count: { select: { comments: true, likes: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!group) return notFound();

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#050510]">
      {/* Main Feed Column */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Cover & Header */}
        <div className="h-64 bg-gradient-to-br from-blue-900/40 to-purple-900/40 relative border-b border-white/10">
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute bottom-0 left-0 w-full p-8 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-bold text-white shadow-lg shadow-blue-500/50">
                  {group.category}
                </span>
                {group.privacy === 'PUBLIC' ? (
                  <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Public Group
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Private Group
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-black text-white mb-2">{group.name}</h1>
              <p className="text-gray-300 max-w-2xl">{group.description}</p>
            </div>
            
            <div className="flex gap-3">
              <Link href={`/dashboard/room/${group.id}`} className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold transition-all shadow-lg backdrop-blur-md flex items-center gap-2">
                <Video className="w-5 h-5 text-green-400" /> Join Live Call
              </Link>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                Join Group
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          
          {/* Create Post */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-4 shadow-xl">
            <div className="flex gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 flex-shrink-0"></div>
              <input 
                type="text" 
                placeholder="Share something with the community..." 
                className="flex-1 bg-transparent border-none focus:outline-none text-white text-lg placeholder-gray-500"
              />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all"><ImageIcon className="w-5 h-5" /></button>
                <button className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-xl transition-all"><Video className="w-5 h-5" /></button>
                <button className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-xl transition-all"><Link2 className="w-5 h-5" /></button>
              </div>
              <button className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all">
                Post
              </button>
            </div>
          </div>

          {/* Feed Posts */}
          {group.posts.map((post) => (
            <div key={post.id} className="bg-black/40 border border-white/10 rounded-3xl p-6 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40"></div>
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-2">
                      {post.author.name || "Anonymous User"}
                      {post.author.isVerified && <span className="w-3 h-3 bg-blue-500 rounded-full"></span>}
                    </h4>
                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-white"><MoreHorizontal className="w-5 h-5" /></button>
              </div>
              
              <p className="text-gray-300 text-lg mb-4 whitespace-pre-wrap">{post.content}</p>
              
              {post.mediaUrl && (
                <div className="mb-4 rounded-2xl overflow-hidden border border-white/10">
                  {post.mediaType === 'IMAGE' ? (
                    <img src={post.mediaUrl} alt="Post media" className="w-full h-auto" />
                  ) : post.mediaType === 'VIDEO' ? (
                    <video src={post.mediaUrl} controls className="w-full h-auto" />
                  ) : null}
                </div>
              )}
              
              <div className="flex items-center gap-6 pt-4 border-t border-white/10 text-gray-400 font-bold text-sm">
                <button className="flex items-center gap-2 hover:text-pink-500 transition-colors">
                  <Heart className="w-5 h-5" /> {post._count.likes}
                </button>
                <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                  <MessageSquare className="w-5 h-5" /> {post._count.comments}
                </button>
                <button className="flex items-center gap-2 hover:text-green-500 transition-colors ml-auto">
                  <Share2 className="w-5 h-5" /> Share
                </button>
              </div>
            </div>
          ))}

          {group.posts.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-black/40 rounded-3xl border border-white/10">
              <MessageSquare className="w-12 h-12 text-gray-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">No posts yet</h3>
              <p className="text-gray-400">Be the first to share something with {group.name}!</p>
            </div>
          )}

        </div>
      </div>

      {/* Right Sidebar (Group Info) */}
      <div className="w-80 border-l border-white/10 bg-black/20 p-6 hidden lg:block overflow-y-auto">
        <h3 className="font-bold text-lg mb-4 text-white">About Community</h3>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-gray-400 text-sm">Members</span>
            <span className="font-bold text-white">{group._count.members}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-gray-400 text-sm">Posts</span>
            <span className="font-bold text-white">{group._count.posts}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-gray-400 text-sm">Created</span>
            <span className="font-bold text-white">{new Date(group.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <h3 className="font-bold text-lg mb-4 text-white">Group Rules</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400 mb-8">
          <li>Be respectful to all members.</li>
          <li>No spam or self-promotion.</li>
          <li>Keep discussions relevant to the category.</li>
          <li>Follow the global community guidelines.</li>
        </ol>

        {/* AdSense Placement */}
        <div className="mt-8">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold text-center">Advertisement</p>
          <AdBanner dataAdSlot="sidebar-group-feed" />
        </div>
      </div>
    </div>
  );
}
