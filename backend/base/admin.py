from django.contrib import admin
from .models import Post, Comment

# Classe personnalisée pour l'administration du modèle Post
class PostAdmin(admin.ModelAdmin):
    list_display = ('title','status','created','publish','author')
    list_filter = ('author', 'created', 'publish')
    search_fields = ('title', 'body')
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'publish'
    ordering = ('author', 'status', 'publish')

# Enregistrement du modèle Post avec la classe d'admin personnalisée
admin.site.register(Post, PostAdmin)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('username','email','created')
    list_filter = ('created','updated')
    search_fields = ('username','body')
    