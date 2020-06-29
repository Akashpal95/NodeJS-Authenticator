
{
    
    let showNotification = function(type, message){
        new Noty({
            theme:'relax',
            text: message,
            type:type,
            layout:'topRight',
            timeout:1500
        }).show();
    }

    let allPostEventSetter =  function(){
        //Setting event on all delete links
        $.each($(' .delete-post-button'), (index, item) => {deletePost(item)});
    }
    //method to submit the form data for new post using AJAX
    let createPost = function(){
        let newPostForm = $('#new-post-form'); 
        //use jQuery function to set submit event listener
        newPostForm.submit(function(e){
            e.preventDefault();
    
            $.ajax({
                type: 'post',
                url: '/posts/create',
                data: newPostForm.serialize(),//jQuery function to serialise for data
                success: function(data){
                    let newPost =  newPostDom(data.data);
                    console.log(data.data.username);
                    $('#posts-list-container > ul').prepend(newPost);
                    deletePost($(' .delete-post-button', newPost));
                    createComment($(' .new-comment-form', newPost));
                    showNotification('success', 'Successfully Posted!!');
                },
                error:function(error){
                    showNotification('error', 'Error in posting status!!');
                    console.log(error.responseText)
                }
            });
        });
    }
    //method to create a posted message in DOM
    let newPostDom = function(data){
        return $(`<li id="post-${data.post._id}">
                    <p>
                        <small>
                            <a class="delete-post-button" href="/posts/destroy/${data.post._id}">X</a>
                        </small>
                        ${data.post.content}
                        <br>
                        <small>
                            -${ data.username}
                        </small>
                    </p>
                    <div id="post-comments">
                            <div class="post-comments-list">
                                    <ul id ="post-comments-${data.post._id}">
                                    </ul>
                                </div>
                            <form action="/comments/create" class="new-comment-form" method="POST">
                                <input type="text" name="content" placeholder="Write comment..." required></textarea>
                                <input type="hidden" name="post" value="${data.post._id}">
                                <input type="submit" value = "Add Comment" >
                            </form>
                        
                    </div>
                    
                </li>`);
    }


    //method to delete a post from DOM
    let deletePost = function(deleteLink){
        $(deleteLink).click(function(e){
            e.preventDefault();
            $.ajax({
                type:'get',
                url: $(deleteLink).prop('href'),
                success: function(data){
                    // console.log(data);  
                    $(`#post-${data.data.post_id}`).remove();
                    showNotification('success', 'Post deleted!!');
                },
                error: function(data){
                    showNotification('error', 'Error in deleting Post!!');
                    console.log('Error:', err.responseText);
                }
            });
        });
    }






    createPost();
    allPostEventSetter();
}