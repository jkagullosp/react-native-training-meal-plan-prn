package com.kernelprn

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative

class MainApplication : Application(), ReactApplication {

  private val _reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = this,
      packageList = PackageList(this).packages,
      isHermesEnabled = true,
      useDevSupport = BuildConfig.DEBUG,
    )
  }

  override val reactHost: ReactHost
    get() = _reactHost

  override val reactNativeHost: ReactNativeHost by lazy {
    object : DefaultReactNativeHost(this) {
      override fun getPackages() = PackageList(this).packages
      override fun getUseDeveloperSupport() = BuildConfig.DEBUG
      override fun getJSMainModuleName() = "index"
    }
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}