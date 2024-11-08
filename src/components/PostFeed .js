import axios from 'axios'; 
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { likePost, unlikePost, fetchPosts } from '../features/postSlice';
import { fetchUserDetails } from '../features/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import SideBar from './SideBar';
import CommentList from './CommentList';
import NotificationsList from './NotificationsList';
import BookmarkButton from './BookmarkButton';
import MessageIcon from './MessageIcon';
import SkeletonLoader from './SkeletonLoader';
import FlagPost from './FlagPost';
import { FaRegThumbsUp } from 'react-icons/fa';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [likedPosts, setLikedPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedInUser = useSelector((state) => state.auth.user);
  const username = loggedInUser ? loggedInUser.username : null;
  const errors = useSelector((state) => state.auth.error);

  // Handle account block alert
  useEffect(() => {
    if (errors === 'Your account has been blocked by the admin.') {
      alert(errors);
    }
  }, [errors]);

  // Redirect if token is missing
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  // Retrieve liked posts from local storage
  useEffect(() => {
    const storedLikedPosts = localStorage.getItem('likedPosts');
    if (storedLikedPosts) {
      setLikedPosts(JSON.parse(storedLikedPosts));
    }
  }, []);

  // Save liked posts to local storage
  useEffect(() => {
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
  }, [likedPosts]);

  // Fetch user details
  useEffect(() => {
    dispatch(fetchUserDetails());
  }, [dispatch]);

  const fetchPostsCallback = useCallback(async (page) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/'); // Redirect if token is missing
        return;
      }
      
      const response = await axios.get(`https://react-vercel-app-gules.vercel.app/posts/fetch-all-posts/?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prevPosts) => {
        const newPosts = response.data.results;
        const combinedPosts = [...prevPosts, ...newPosts];
        const uniquePosts = Array.from(new Map(combinedPosts.map(post => [post.id, post])).values());
        return uniquePosts;
      });

      setHasMore(page < Math.ceil(response.data.count / 10));
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate('/'); // Unauthorized error - redirect to login
      } else {
        setError('Error fetching posts');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPostsCallback(currentPage);
  }, [currentPage, fetchPostsCallback]);

  const handleLikeToggle = (post) => {
    const isLiked = likedPosts.includes(post.id);
    const newLikedPosts = isLiked 
      ? likedPosts.filter(id => id !== post.id)
      : [...likedPosts, post.id];

    setLikedPosts(newLikedPosts);

    const updatedPosts = posts.map(p => {
      if (p.id === post.id) {
        return { ...p, total_likes: isLiked ? p.total_likes - 1 : p.total_likes + 1 };
      }
      return p;
    });
    setPosts(updatedPosts);

    const action = isLiked ? unlikePost(post.id) : likePost(post.id);
    dispatch(action).then(() => {
      dispatch(fetchPosts());
    });
  };

  const observer = useRef();
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const renderContentWithHashtags = (content) => {
    const hashtagRegex = /#(\w+)/g;
    const parts = content.split(hashtagRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <Link key={index} to={`/hashtag/${part}`} className="text-blue-500 hover:underline">
            #{part}
          </Link>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar />
      <div className="flex-1 flex flex-col ml-4">
        <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg p-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-white text-xl font-bold">Welcome, {username}</h1>
          <NotificationsList />
          <MessageIcon />
        </nav>

        <div className="flex-1 p-4 overflow-auto bg-gray-50">
          <div className="space-y-4">
            {posts.map((post, index) => {
              const isLastPost = posts.length === index + 1;
              return (
                <div
                  key={post.id}
                  ref={isLastPost ? lastPostElementRef : null}
                  className="bg-white border shadow-lg rounded-lg p-4 mx-auto transition-transform hover:shadow-2xl"
                >
                  <h2 className="font-semibold text-lg text-blue-600">{post.user?.first_name || 'Unknown User'}</h2>
                  <p className="text-gray-800">{renderContentWithHashtags(post.content)}</p>
                  <div className="flex items-center space-x-4">
                    <button onClick={() => handleLikeToggle(post)}>
                      <FaRegThumbsUp className={likedPosts.includes(post.id) ? 'text-blue-500' : 'text-gray-500'} />
                    </button>
                    <span>{post.total_likes}</span>
                    <CommentList postId={post.id} />
                    <BookmarkButton postId={post.id} />
                    <FlagPost postId={post.id} />
                  </div>
                </div>
              );
            })}
            {loading && <SkeletonLoader />}
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostFeed;
