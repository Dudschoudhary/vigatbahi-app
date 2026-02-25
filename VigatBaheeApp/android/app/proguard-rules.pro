# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep native methods
-keepclassmembers class *  {
    @com.facebook.react.bridge.ReactMethod <methods>;
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}

# Hermes
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.hermes.**

# OkHttp (used by React Native networking)
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**

# Keep Annotations
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
