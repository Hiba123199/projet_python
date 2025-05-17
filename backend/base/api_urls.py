from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api
from . import admin_api

# Configuration du router pour les viewsets standards
router = DefaultRouter()
router.register(r'posts', api.PostViewSet)

# Configuration du router pour les viewsets d'administration
admin_router = DefaultRouter()
admin_router.register(r'posts', admin_api.PostAdminViewSet)
admin_router.register(r'comments', admin_api.CommentAdminViewSet)
admin_router.register(r'likes', admin_api.LikesAdminViewSet)
admin_router.register(r'users', admin_api.UserAdminViewSet)

urlpatterns = [
    path('', api.api_overview, name='api-overview'),
    path('', include(router.urls)),
    path('users/', api.user_list, name='user-list'),
    path('users/<int:pk>/', api.user_detail, name='user-detail'),
    
    # Endpoints de likes
    path('posts/<slug:slug>/likes/', api.post_likes, name='post-likes'),
    path('posts/<slug:slug>/toggle-like/', api.toggle_like, name='toggle-like'),
    path('posts/<slug:slug>/like-status/', api.check_like_status, name='check-like-status'),
    path('user/liked-posts/', api.user_liked_posts, name='user-liked-posts'),
    
    # Endpoints de commentaires
    path('posts/<slug:slug>/comments/', api.post_comments, name='post-comments'),
    path('posts/<slug:slug>/add-comment/', api.add_comment, name='add-comment'),
    path('comments/<int:comment_id>/', api.delete_comment, name='delete-comment'),
    
    # Endpoints d'administration
    path('admin/', include(admin_router.urls)),
    path('admin/stats/', admin_api.admin_stats, name='admin-stats'),
    path('admin/filter-posts/', admin_api.filter_posts, name='filter-posts'),
]
