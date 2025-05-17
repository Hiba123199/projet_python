from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Post, Comment, Likes
from .serializers import PostSerializer, UserSerializer
from django.utils.text import slugify

# Serializers pour l'administration
from rest_framework import serializers

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'

class LikesSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    post_title = serializers.CharField(source='post.title', read_only=True)
    
    class Meta:
        model = Likes
        fields = ['id', 'user', 'post', 'created_at', 'username', 'post_title']

class PostAdminSerializer(serializers.ModelSerializer):
    comments_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'body', 'created', 'updated', 'status', 
                 'publish', 'author', 'author_username', 'comments_count', 'likes_count']
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def get_likes_count(self, obj):
        return obj.total_likes()

# ViewSets pour l'administration
class PostAdminViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour l'administration des posts
    """
    permission_classes = [IsAdminUser]
    queryset = Post.objects.all().order_by('-created')
    serializer_class = PostAdminSerializer
    
    def perform_create(self, serializer):
        # Création du slug automatiquement si non fourni
        if not serializer.validated_data.get('slug'):
            title = serializer.validated_data.get('title', '')
            serializer.validated_data['slug'] = slugify(title)
        serializer.save()

class CommentAdminViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour l'administration des commentaires
    """
    permission_classes = [IsAdminUser]
    queryset = Comment.objects.all().order_by('-created')
    serializer_class = CommentSerializer

class LikesAdminViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour l'administration des likes
    """
    permission_classes = [IsAdminUser]
    queryset = Likes.objects.all().order_by('-created_at')
    serializer_class = LikesSerializer

class UserAdminViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour l'administration des utilisateurs
    """
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    serializer_class = UserSerializer

# API pour obtenir des statistiques
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    """
    Fournit des statistiques générales pour le tableau de bord d'administration
    """
    stats = {
        'users_count': User.objects.count(),
        'posts_count': Post.objects.count(),
        'comments_count': Comment.objects.count(),
        'likes_count': Likes.objects.count(),
        'published_posts': Post.objects.filter(status='published').count(),
        'draft_posts': Post.objects.filter(status='draft').count(),
    }
    return Response(stats)

# Filtrage des posts par statut
@api_view(['GET'])
@permission_classes([IsAdminUser])
def filter_posts(request):
    """
    Filtre les posts par statut (publié/brouillon)
    """
    status_param = request.query_params.get('status', None)
    if status_param and status_param in ['published', 'draft']:
        posts = Post.objects.filter(status=status_param).order_by('-created')
        serializer = PostAdminSerializer(posts, many=True)
        return Response(serializer.data)
    
    return Response({'error': 'Invalid status parameter'}, status=status.HTTP_400_BAD_REQUEST)
