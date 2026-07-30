from django.contrib import admin
from .models import (
    User, ChildProfile, Story, StoryPage, ReadingLog, Achievement, ChildAchievement,
    StoryApproval, Notification, ChildGoal, ReadingStreak, ReadingSchedule,
    StoryRating, RewardShopItem, RewardPurchase
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_active')
    list_filter = ('role',)
    search_fields = ('username', 'email')


@admin.register(ChildProfile)
class ChildProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'age', 'gender', 'grade_level', 'created_at')
    list_filter = ('gender', 'grade_level')
    search_fields = ('name', 'parent__username')


@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'child_name', 'builder_mode', 'language', 'created_at')
    list_filter = ('builder_mode', 'language')
    search_fields = ('title_en', 'child_name')


@admin.register(StoryPage)
class StoryPageAdmin(admin.ModelAdmin):
    list_display = ('story', 'page_number')
    list_filter = ('story',)


@admin.register(ReadingLog)
class ReadingLogAdmin(admin.ModelAdmin):
    list_display = ('child', 'story_title', 'read_date', 'reading_time_minutes', 'completed')
    list_filter = ('completed', 'read_date')
    search_fields = ('story_title', 'child__name')


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'emoji', 'required_count')


@admin.register(ChildAchievement)
class ChildAchievementAdmin(admin.ModelAdmin):
    list_display = ('child', 'achievement', 'earned_at')
    list_filter = ('achievement',)


@admin.register(StoryApproval)
class StoryApprovalAdmin(admin.ModelAdmin):
    list_display = ('story', 'parent', 'status', 'created_at')
    list_filter = ('status',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')


@admin.register(ChildGoal)
class ChildGoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'child', 'goal_type', 'status', 'deadline')
    list_filter = ('status', 'goal_type')


@admin.register(ReadingStreak)
class ReadingStreakAdmin(admin.ModelAdmin):
    list_display = ('child', 'current_streak', 'longest_streak', 'total_stars')


@admin.register(ReadingSchedule)
class ReadingScheduleAdmin(admin.ModelAdmin):
    list_display = ('child', 'day_of_week', 'time', 'is_active')
    list_filter = ('day_of_week', 'is_active')


@admin.register(StoryRating)
class StoryRatingAdmin(admin.ModelAdmin):
    list_display = ('story', 'parent', 'rating', 'created_at')
    list_filter = ('rating',)


@admin.register(RewardShopItem)
class RewardShopItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'cost_stars', 'emoji', 'is_active')
    list_filter = ('category', 'is_active')


@admin.register(RewardPurchase)
class RewardPurchaseAdmin(admin.ModelAdmin):
    list_display = ('child', 'item', 'purchased_at')

