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
        <div>
        User: {user}, Comment: {comment} {timestamp === null ? null : `, Date: ${formattedDate}`}
        </div>
    );
};

Comment.displayName = 'Comment';

export default Comment;
