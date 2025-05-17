from django.contrib import admin
from .models import Post, Comment, Likes
from django.utils.safestring import mark_safe

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
    
@admin.register(Likes)
class LikesAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'created_at', 'get_post_title')
    list_filter = ('created_at', 'post')
    search_fields = ('user__username', 'post__title')
    date_hierarchy = 'created_at'
    raw_id_fields = ('user', 'post')
    
    def get_post_title(self, obj):
        return mark_safe(f'<a href="/admin/base/post/{obj.post.id}/change/">{obj.post.title}</a>')
    
    get_post_title.short_description = 'Post Title'
    