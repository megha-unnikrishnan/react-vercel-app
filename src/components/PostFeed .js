// // PostFeed.js
// import axios from 'axios';
// import SideBar from './SideBar';
// import { FaRegThumbsUp, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
// import CommentList from './CommentList';
// import { useState, useEffect, useCallback, useRef } from 'react';
// import { likePost, unlikePost } from '../features/postSlice';
// import { useDispatch, useSelector } from 'react-redux';
// import NotificationsList from './NotificationsList';
// import BookmarkButton from './BookmarkButton';
// import { Link } from 'react-router-dom';
// import { fetchUserDetails } from '../features/authSlice';
// import MessageIcon from './MessageIcon';
// import SkeletonLoader from './SkeletonLoader'; // Import the SkeletonLoader
// import FlagPost from './FlagPost';
// const PostFeed = () => {
//   const [posts, setPosts] = useState([]);
//   const [error, setError] = useState(null);
//   const [likedPosts, setLikedPosts] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const dispatch = useDispatch();

//   const loggedInUser = useSelector((state) => state.auth.user); 
//   const username = loggedInUser ? loggedInUser.first_name : null;

//   useEffect(() => {
//     const storedLikedPosts = localStorage.getItem('likedPosts');
//     if (storedLikedPosts) {
//       setLikedPosts(JSON.parse(storedLikedPosts));
//     }
//   }, []);

//   useEffect(() => {
//     localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
//   }, [likedPosts]);

//   useEffect(() => {
//     dispatch(fetchUserDetails());
//   }, [dispatch]);

//   const fetchPostsCallback = useCallback(async (page) => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`https://react-vercel-app-gules.vercel.app/posts/fetch-all-posts/?page=${page}`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//       });
//       setPosts((prevPosts) => [...prevPosts, ...response.data.results]);
//       setTotalPages(Math.ceil(response.data.count / 10));
//       if (page >= Math.ceil(response.data.count / 10)) {
//         setHasMore(false);
//       }
//     } catch (error) {
//       console.error('Error fetching posts:', error);
//       setError('Error fetching posts');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchPostsCallback(currentPage);
//   }, [currentPage, fetchPostsCallback]);

//   const handleLikeToggle = useCallback((post) => {
//     const isLiked = likedPosts.includes(post.id);

//     const newLikedPosts = isLiked
//       ? likedPosts.filter((id) => id !== post.id)
//       : [...likedPosts, post.id];

//     const action = isLiked ? unlikePost(post.id) : likePost(post.id);

//     dispatch(action).then(() => {
//       setLikedPosts(newLikedPosts);
//       // Optionally, you can refetch posts or update the specific post's like count
//     });
//   }, [likedPosts, dispatch]);

//   const observer = useRef();

//   const lastPostElementRef = useCallback(
//     (node) => {
//       if (loading) return;
//       if (observer.current) observer.current.disconnect();
//       observer.current = new IntersectionObserver((entries) => {
//         if (entries[0].isIntersecting && hasMore) {
//           setCurrentPage((prevPage) => prevPage + 1);
//         }
//       });
//       if (node) observer.current.observe(node);
//     },
//     [loading, hasMore]
//   );

//   const renderContentWithHashtags = (content) => {
//     const hashtagRegex = /#(\w+)/g;
//     const parts = content.split(hashtagRegex);

//     return parts.map((part, index) => {
//       if (index % 2 === 1) {
//         return (
//           <Link key={index} to={`/hashtag/${part}`} className="text-blue-500 hover:underline">
//             #{part}
//           </Link>
//         );
//       }
//       return <span key={index}>{part}</span>;
//     });
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       <div className="w-1/4 bg-white shadow-md p-4 hidden md:block" style={{ width: '16%' }}>
//         <SideBar />
//       </div>

//       <div className="flex-1 flex flex-col ml-4">
//         <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg p-4 flex items-center justify-between sticky top-0 z-10" style={{marginLeft:'-3px'}}>
//           <div className="flex items-center space-x-4 ml-auto">
//             <h1 className="text-white text-xl font-bold">Welcome, {username}</h1>
//             <NotificationsList />
//             <MessageIcon />
//           </div>
//         </nav>

//         <div className="flex-1 p-4 overflow-auto bg-gray-50">
//           <div className="space-y-4">
//             {posts.map((post, index) => {
//               if (posts.length === index + 1) {
//                 // Attach ref to the last post for infinite scrolling
//                 return (
//                   <div
//                     key={post.id}
//                     ref={lastPostElementRef}
//                     className="bg-white border border-gray-300 shadow-lg rounded-lg p-4 mx-auto transition-transform duration-300 hover:shadow-2xl hover:border-blue-500"
//                     style={{ width: '100%', maxWidth: '600px' }}
//                   >
//                     {/* Post Content */}
//                     <div className="flex items-start mb-4">
//                       <img
//                         src={post.user?.profile_picture || '/path/to/default-avatar.png'}
//                         alt="Profile"
//                         className="w-12 h-12 rounded-full border-2 border-blue-500 mr-4 object-cover"
//                       />
//                       <div className="flex-1">
//                         <div className="flex justify-between items-start mb-2">
//                           <h2 className="font-semibold text-lg text-blue-600">
//                             {post.user?.username || 'Unknown User'}
//                           </h2>
//                           <span className="text-gray-500 text-sm">
//                             {new Date(post.created_at).toLocaleDateString()}
//                           </span>
//                         </div>
//                         <p className="text-gray-800 mb-2">{renderContentWithHashtags(post.content)}</p>
//                         {post.image && (
//                           <img
//                             src={post.image}
//                             alt="Post"
//                             className="w-full h-72 object-cover rounded-md mb-4 shadow-sm transition-transform duration-300 hover:scale-105"
//                           />
//                         )}
//                         {post.video && (
//                           <video controls className="w-full h-80 object-cover rounded-md mb-4 shadow-sm">
//                             <source src={post.video} type="video/mp4" />
//                             Your browser does not support the video tag.
//                           </video>
//                         )}
//                         <div className="flex justify-between items-center mt-2 border-t border-gray-300 pt-2">
//                           <div className="flex space-x-4">
//                             <div className="flex items-center space-x-1">
//                               <button type="button" onClick={() => handleLikeToggle(post)} className="flex items-center">
//                                 {likedPosts.includes(post.id) ? (
//                                   <FaRegThumbsUp className="h-5 w-5 text-blue-500 hover:text-blue-700 transition duration-200" />
//                                 ) : (
//                                   <FaRegThumbsUp className="h-5 w-5 text-gray-500 hover:text-gray-700 transition duration-200" />
//                                 )}
//                               </button>
//                               <span className="text-gray-600">{post.total_likes}</span>
//                             </div>
//                             <BookmarkButton postId={post.id} />
                           
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                     <CommentList postId={post.id} />
//                   </div>
//                 );
//               } else {
//                 return (
//                   <div
//                     key={post.id}
//                     className="bg-white border border-gray-300 shadow-lg rounded-lg p-4 mx-auto transition-transform duration-300 hover:shadow-2xl hover:border-blue-500"
//                     style={{ width: '100%', maxWidth: '600px' }}
//                   >
//                     {/* Post Content */}
//                     <div className="flex items-start mb-4">
//                       <img
//                         src={post.user?.profile_picture || '/path/to/default-avatar.png'}
//                         alt="Profile"
//                         className="w-12 h-12 rounded-full border-2 border-blue-500 mr-4 object-cover"
//                       />
//                       <div className="flex-1">
//                         <div className="flex justify-between items-start mb-2">
//                           <h2 className="font-semibold text-lg text-blue-600">
//                             {post.user?.username || 'Unknown User'}
//                           </h2>
//                           <span className="text-gray-500 text-sm">
//                             {new Date(post.created_at).toLocaleDateString()}
//                           </span>
//                         </div>
//                         <p className="text-gray-800 mb-2">{renderContentWithHashtags(post.content)}</p>
//                         {post.image && (
//                           <img
//                             src={post.image}
//                             alt="Post"
//                             className="w-full h-72 object-cover rounded-md mb-4 shadow-sm transition-transform duration-300 hover:scale-105"
//                           />
//                         )}
//                         {post.video && (
//                           <video controls className="w-full h-80 object-cover rounded-md mb-4 shadow-sm">
//                             <source src={post.video} type="video/mp4" />
//                             Your browser does not support the video tag.
//                           </video>
//                         )}
//                         <div className="flex justify-between items-center mt-2 border-t border-gray-300 pt-2">
//                           <div className="flex space-x-4">
//                             <div className="flex items-center space-x-1">
//                               <button type="button" onClick={() => handleLikeToggle(post)} className="flex items-center">
//                                 {likedPosts.includes(post.id) ? (
//                                   <FaRegThumbsUp className="h-5 w-5 text-blue-500 hover:text-blue-700 transition duration-200" />
//                                 ) : (
//                                   <FaRegThumbsUp className="h-5 w-5 text-gray-500 hover:text-gray-700 transition duration-200" />
//                                 )}
//                               </button>
//                               <span className="text-gray-600">{post.total_likes}</span>
//                             </div>
//                             <BookmarkButton postId={post.id} />
                           
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                     <CommentList postId={post.id} />
//                   </div>
//                 );
//               }
//             })}

//             {loading && <SkeletonLoader />}

//             {error && <div className="text-red-500 text-center">{error}</div>}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PostFeed;






import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = https://react-vercel-app-gules.vercel.app/posts/fetch-all-posts/';

  useEffect(() => {
    fetchPosts(API_URL);
  }, []);

  const fetchPosts = async (url) => {
    setLoading(true);
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      setPosts(prevPosts => [...prevPosts, ...response.data.results]);
      setNextPage(response.data.next);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setLoading(false);
  };

  const loadMorePosts = () => {
    if (nextPage) {
      fetchPosts(nextPage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Posts</h1>
      {posts.map(post => (
        <div key={post.id} className="bg-white shadow-md rounded-lg p-6 mb-4">
          <div className="flex items-center mb-4">
            <div className="mr-3">
              <img
                src={post.user.profile_picture || 'https://via.placeholder.com/50'}
                alt="User profile"
                className="w-12 h-12 rounded-full"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{post.user.username}</h2>
              <p className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-gray-800 mb-4">{post.content}</p>
          {post.image && (
            <img
              src={post.image}
              alt="Post content"
              className="w-full h-auto rounded-md mb-4"
            />
          )}
          {post.video && (
            <video
              src={post.video}
              controls
              className="w-full h-auto rounded-md mb-4"
            />
          )}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Likes: {post.total_likes}</p>
            <p className="text-sm text-gray-600">Comments: {post.total_comments}</p>
          </div>
        </div>
      ))}
      {loading ? (
        <p className="text-center text-gray-500 mt-4">Loading...</p>
      ) : (
        nextPage && (
          <button
            onClick={loadMorePosts}
            className="mt-4 block mx-auto bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Load More
          </button>
        )
      )}
    </div>
  );
};

export default PostFeed;

