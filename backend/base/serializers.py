from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, Likes, Comment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'created', 'slug', 'featured', 'author', 'likes_count']
    
    def get_likes_count(self, obj):
        return obj.total_likes()

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(source='author', queryset=User.objects.all(), write_only=True)
    post_id = serializers.PrimaryKeyRelatedField(source='post', queryset=Post.objects.all(), write_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'post_id', 'username', 'email', 'author', 'author_id', 'body', 'created', 'updated']
        read_only_fields = ['id', 'created', 'updated']

class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post = PostSerializer(read_only=True)
    post_id = serializers.PrimaryKeyRelatedField(source='post', queryset=Post.objects.all(), write_only=True)
    
    class Meta:
        model = Likes
        fields = ['id', 'user', 'post', 'post_id', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']
