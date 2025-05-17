from django.urls import path
from . import views
from django.http import Http404

urlpatterns = [
    path('', views.post_list, name='post_list'),
    path('post/<str:slug>/', views.post_detail, name='post_detail'),
    path('like/<str:slug>/', views.like_post, name='like_post'),
    path('search/', views.search_posts, name='search_posts'),
]