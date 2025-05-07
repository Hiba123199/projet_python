from django.shortcuts import render
from django.http import Http404
from .forms import CommentForm
from django.core.paginator import (
    Paginator,
    EmptyPage,
    PageNotAnInteger,
)
from .models import Post
# Create your views here.
def post_list(request):
    posts = Post.published.all()
    paginator = Paginator(posts, 2)
    page = request.GET.get('page')
    try:
        posts = paginator.page(page)
    except PageNotAnInteger:
        posts = paginator.page(1)
    except EmptyPage:
        posts = paginator.page(paginator.num_pages)
    context = {
        'posts': posts,
        'page': page,
    }
    return render(request, 'list.html', context)

def post_detail(request,slug):
    try:
        post = Post.objects.get(slug=slug)
    except Post.DoesNotExist:
        raise Http404("Post not found")
    comments = post.comments.all()
    new_comment = None
    if request.method == 'POST':
        comment_form = CommentForm(data=request.POST)
        if comment_form.is_valid():
            new_comment = comment_form.save(commit=False)
            new_comment.post = post
            new_comment.save()
    else:
        comment_form = CommentForm()
    return render(request, 'detail.html', {'post': post,
    'comments':comments,
    'new_comment':new_comment,
    'comment_form':comment_form})
    