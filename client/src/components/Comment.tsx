import React from 'react';

interface CommentInter {
	id: number,
	comment?: string,
	user?: string,
	timestamp?: string
}

const Comment = ({ id, comment, user, timestamp }:CommentInter) => {
	let formattedDate = '';
	if(typeof timestamp === 'string'){
		formattedDate = new Date(timestamp.toString()).toLocaleString()
	}

    return (
        <div className="comment-card  border my-3">
          <div className="card-top block md:flex justify-between bg-gray-100 border-b-2 p-3">
              <span className="name">
                {user}  
              </span>

              <span className="date">
                {timestamp === null ? null : `${formattedDate}`}
              </span>
          </div>

          <div className="content p-3 py-5">
            Comment: {comment} 
          </div>
        
        </div>
    );
};

Comment.displayName = 'Comment';

export default Comment;
