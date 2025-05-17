from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Post, Likes, Comment
from .serializers import PostSerializer, UserSerializer, LikeSerializer, CommentSerializer
from django.contrib.auth.models import User

class PostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint pour lister et récupérer les posts
    """
    queryset = Post.objects.all().order_by('-created')
    serializer_class = PostSerializer
    lookup_field = 'slug'
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Ajouter les commentaires au post
        comments = Comment.objects.filter(post=instance).order_by('-created')
        comments_serializer = CommentSerializer(comments, many=True)
        data['comments'] = comments_serializer.data
        
        return Response(data)

@api_view(['GET'])
def api_overview(request):
    """
    Vue d'ensemble des différents endpoints d'API disponibles
    """
    api_urls = {
        'Liste des posts': '/api/posts/',
        'Détail d\'un post': '/api/posts/<slug>/',
        'Liste des utilisateurs': '/api/users/',
        'Profil utilisateur': '/api/users/<id>/'
    }
    return Response(api_urls)

@api_view(['GET'])
def user_list(request):
    """
    Liste tous les utilisateurs
    """
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def user_detail(request, pk):
    """
    Détail d'un utilisateur spécifique
    """
    user = get_object_or_404(User, pk=pk)
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['POST', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def toggle_like(request, slug):
    """
    Ajouter ou supprimer un like sur un post
    """
    post = get_object_or_404(Post, slug=slug)
    user = request.user
    
    # Vérifier si l'utilisateur a déjà liké ce post
    try:
        like = Likes.objects.get(user=user, post=post)
        # Si DELETE request, supprimer le like
        if request.method == 'DELETE':
            like.delete()
            post.likes.remove(user)  # Gérer aussi le ManyToManyField
            return Response({'status': 'like removed'}, status=status.HTTP_200_OK)
        # Si POST request sur un like existant, ne rien faire
        return Response({'status': 'already liked'}, status=status.HTTP_200_OK)
    except Likes.DoesNotExist:
        # Si POST request, créer un nouveau like
        if request.method == 'POST':
            Likes.objects.create(user=user, post=post)
            post.likes.add(user)  # Gérer aussi le ManyToManyField
            return Response({'status': 'like added'}, status=status.HTTP_201_CREATED)
        # Si DELETE request sur un like inexistant, ne rien faire
        return Response({'status': 'not liked'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def post_likes(request, slug):
    """
    Liste tous les likes pour un post spécifique
    """
    post = get_object_or_404(Post, slug=slug)
    likes = Likes.objects.filter(post=post)
    serializer = LikeSerializer(likes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_liked_posts(request):
    """
    Liste tous les posts likés par l'utilisateur authentifié
    """
    likes = Likes.objects.filter(user=request.user)
    serializer = LikeSerializer(likes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_like_status(request, slug):
    """
    Vérifie si l'utilisateur authentifié a liké un post spécifique
    """
    post = get_object_or_404(Post, slug=slug)
    liked = Likes.objects.filter(user=request.user, post=post).exists()
    return Response({'liked': liked})

@api_view(['GET'])
def post_comments(request, slug):
    """
    Liste tous les commentaires pour un post spécifique
    """
    post = get_object_or_404(Post, slug=slug)
    comments = Comment.objects.filter(post=post).order_by('-created')
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_comment(request, slug):
    """
    Ajouter un commentaire à un post spécifique
    """
    post = get_object_or_404(Post, slug=slug)
    
    # Créer un nouveau serializer avec les données de la requête
    data = {
        'post_id': post.id,
        'author_id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'body': request.data.get('body', '')
    }
    
    serializer = CommentSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_comment(request, comment_id):
    """
    Supprimer un commentaire
    """
    comment = get_object_or_404(Comment, id=comment_id)
    
    # Vérifier si l'utilisateur est l'auteur du commentaire
    if comment.author != request.user:
        return Response(
            {'detail': 'Vous n\'avez pas les droits pour supprimer ce commentaire.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    comment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
