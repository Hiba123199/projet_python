from django.urls import path
from . import views
from django.http import Http404
urlpatterns = [
    path('', views.post_list, name='post_list'),
    path('post/<str:slug>/', views.post_detail, name='post_detail'),
]