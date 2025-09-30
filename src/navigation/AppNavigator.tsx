import React from 'react';
import { View, Text, Easing } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import WelcomeScreen from '../screens/WelcomeScreen';
import OnboardingStep1Screen from '../screens/OnboardingStep1Screen';
import OnboardingStep2Screen from '../screens/OnboardingStep2Screen';
import OnboardingStep3Screen from '../screens/OnboardingStep3Screen';
import FinalOnboardingScreen from '../screens/FinalOnboardingScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SignInScreen from '../screens/SignInScreen';
import HomeScreen from '../screens/HomeScreen';
import VideoUploadScreen from '../screens/VideoUploadScreen';
import MusicGenerationScreen from '../screens/MusicGenerationScreen';
import PreviewScreen from '../screens/PreviewScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PaywallScreen from '../screens/PaywallScreen';

export type RootStackParamList = {
  Welcome: undefined;
  OnboardingStep1: undefined;
  OnboardingStep2: undefined;
  OnboardingStep3: undefined;
  FinalOnboarding: undefined;
  SignUp: undefined;
  SignIn: undefined;
  MainTabs: undefined;
  VideoUpload: undefined;
  MusicGeneration: { videoUri: string; prompt?: string };
  Preview: { videoUri: string; audioUri: string };
  Paywall: undefined;
};

export type TabParamList = {
  Home: undefined;
  Generate: undefined;
  Library: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Smooth onboarding transition animations
const onboardingTransition = {
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 400,
        easing: Easing.out(Easing.poly(4)),
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 350,
        easing: Easing.in(Easing.poly(4)),
      },
    },
  },
  cardStyleInterpolator: ({ current, layouts }: any) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
        opacity: current.progress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.8, 1],
        }),
      },
    };
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Generate') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Library') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'home-outline';
          }

          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons name={iconName} size={20} color={color} />
            </View>
          );
        },
        tabBarLabel: ({ focused, children }) => (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: focused ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 8,
            minWidth: 60,
            marginTop: 4,
          }}>
            <Text style={{
              fontSize: 11,
              fontWeight: focused ? '600' : '500',
              color: focused ? '#A855F7' : 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
            }}>
              {children}
            </Text>
          </View>
        ),
        tabBarActiveTintColor: '#A855F7',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(42, 26, 62, 0.95)',
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          height: 80,
          paddingTop: 8,
          paddingBottom: 16,
          paddingHorizontal: 12,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
          marginHorizontal: 2,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Generate"
        component={VideoUploadScreen}
        options={{ tabBarLabel: 'Create' }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{ tabBarLabel: 'Library' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            ...onboardingTransition,
          }}
        />
        <Stack.Screen
          name="OnboardingStep1"
          component={OnboardingStep1Screen}
          options={{
            ...onboardingTransition,
          }}
        />
        <Stack.Screen
          name="OnboardingStep2"
          component={OnboardingStep2Screen}
          options={{
            ...onboardingTransition,
          }}
        />
        <Stack.Screen
          name="OnboardingStep3"
          component={OnboardingStep3Screen}
          options={{
            ...onboardingTransition,
          }}
        />
        <Stack.Screen
          name="FinalOnboarding"
          component={FinalOnboardingScreen}
          options={{
            ...onboardingTransition,
          }}
        />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="VideoUpload"
          component={VideoUploadScreen}
          options={{ headerShown: true, title: 'Upload Video' }}
        />
        <Stack.Screen
          name="MusicGeneration"
          component={MusicGenerationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Preview"
          component={PreviewScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}