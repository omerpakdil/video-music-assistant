import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import OnboardingTemplate from '../components/OnboardingTemplate';

type OnboardingStep1ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OnboardingStep1'>;

interface Props {
  navigation: OnboardingStep1ScreenNavigationProp;
}

export default function OnboardingStep1Screen({ navigation }: Props) {
  const handleNext = () => {
    navigation.navigate('OnboardingStep2');
  };

  const handleSkip = () => {
    navigation.navigate('FinalOnboarding');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <OnboardingTemplate
      currentStep={1}
      totalSteps={3}
      title="Smart Video Analysis"
      description="Our AI analyzes your video's tempo, mood, and scene dynamics to create the perfect soundtrack that matches every moment."
      icon="analytics"
      onNext={handleNext}
      onSkip={handleSkip}
      onBack={handleBack}
    />
  );
}