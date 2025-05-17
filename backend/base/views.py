from django.shortcuts import render, redirect, get_object_or_404
from django.http import Http404, HttpResponseRedirect
from django.urls import reverse
from .forms import CommentForm
from django.core.paginator import (
    Paginator,
    EmptyPage,
    PageNotAnInteger,
)
from .models import Post
from django.contrib.auth.decorators import login_required
from django.db.models import Q
# Create your views here.
def post_list(request):
    query = request.GET.get('q', '')
    posts = Post.published.all()
    
    # Si une requête de recherche est fournie, filtrer les posts
    if query:
        posts = posts.filter(
            Q(title__icontains=query) | 
            Q(body__icontains=query) |
            Q(author__username__icontains=query)
        )
    
    paginator = Paginator(posts, 6)  # Afficher 6 articles par page
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
        'query': query,  # Passer la requête à la template pour conserver dans la pagination
    }
    return render(request, 'list.html', context)

def search_posts(request):
    query = request.GET.get('q', '')
    results = []
    
    if query:
        results = Post.published.filter(
            Q(title__icontains=query) | 
            Q(body__icontains=query) |
            Q(author__username__icontains=query)
        )
        
    paginator = Paginator(results, 6)  # Afficher 6 articles par page
    page = request.GET.get('page')
    try:
        results = paginator.page(page)
    except PageNotAnInteger:
        results = paginator.page(1)
    except EmptyPage:
        results = paginator.page(paginator.num_pages)
        
    context = {
        'posts': results,
        'query': query,
        'page': page,
        'search_results': True,
    }
    
    return render(request, 'list.html', context)

def post_detail(request,slug):
    try:
        post = Post.objects.get(slug=slug)
    except Post.DoesNotExist:
        raise Http404("Post not found")
    
    # Compter les likes
    total_likes = post.total_likes()
    
    # Vérifier si l'utilisateur a déjà liké le post avec le nouveau modèle Likes
    liked = False
    if request.user.is_authenticated:
        from .models import Likes
        if Likes.objects.filter(post=post, user=request.user).exists():
            liked = True
    
    # Gérer les commentaires
    comments = post.comments.all()
    new_comment = None
    comment_form = None
    
    # Vérifier si l'utilisateur est authentifié avant de traiter les commentaires
    if request.user.is_authenticated:
        if request.method == 'POST':
            comment_form = CommentForm(data=request.POST)
            if comment_form.is_valid():
                new_comment = comment_form.save(commit=False)
                new_comment.post = post
                new_comment.author = request.user
                new_comment.username = request.user.username  # Auto-remplir le nom d'utilisateur
                new_comment.email = request.user.email  # Auto-remplir l'email s'il existe
                new_comment.save()
        else:
            comment_form = CommentForm()
        
    context = {
        'post': post,
        'comments': comments,
        'new_comment': new_comment,
        'comment_form': comment_form,
        'total_likes': total_likes,
        'liked': liked,
    }
    
    return render(request, 'detail.html', context)

@login_required
def like_post(request, slug):
    post = get_object_or_404(Post, slug=slug)
    from .models import Likes
    
    # Si l'utilisateur a déjà liké le post, on retire son like (unlike)
    like_exists = Likes.objects.filter(post=post, user=request.user).exists()
    if like_exists:
        # Supprimer le like existant
        Likes.objects.filter(post=post, user=request.user).delete()
    # Sinon, on ajoute son like
    else:
        # Créer un nouveau like
        Likes.objects.create(post=post, user=request.user)
    
    # Rediriger vers la page d'où vient la requête
    return HttpResponseRedirect(reverse('post_detail', args=[slug]))
    