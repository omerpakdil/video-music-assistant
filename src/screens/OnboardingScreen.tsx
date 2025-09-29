import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';

type OnboardingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }: Props) {
  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleLogIn = () => {
    navigation.navigate('SignIn');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#4A5B3A', '#2A1A3E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Create Your Own AI Music</Text>
            <Text style={styles.description}>
              Transform your videos with custom-{'\n'}generated music that perfectly matches the{'\n'}mood and action.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleSignUp}>
              <LinearGradient
                colors={['#A855F7', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signUpButton}
              >
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logInButton} onPress={handleLogIn}>
              <Text style={styles.logInButtonText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 64,
    letterSpacing: -1,
  },
  description: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.7,
    fontWeight: '400',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  signUpButton: {
    paddingVertical: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  logInButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logInButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});