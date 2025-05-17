from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _


class PublishedManager(models.Manager):
    def get_queryset(self):
        return super(PublishedManager, self).get_queryset().filter(status='published')

# Create your models here.
class Post(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
    )

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200)
    body = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    status = models.CharField(choices=STATUS_CHOICES, default='draft', max_length=10)
    publish = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted')
    objects = models.Manager()
    published = PublishedManager()
    def __str__(self):
        return self.title
        
    def total_likes(self):
        # Utilise le nouveau modèle Likes au lieu du ManyToManyField
        return Likes.objects.filter(post=self).count()

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    username = models.CharField(max_length=100)
    email = models.EmailField(max_length=200)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.post.title


class Likes(models.Model):
    """
    Model to track likes on posts with additional metadata
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_like_details')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('Like')
        verbose_name_plural = _('Likes')
        unique_together = ('user', 'post')  # Ensure a user can like a post only once
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} likes {self.post.title}"