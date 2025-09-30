import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import OnboardingTemplate from '../components/OnboardingTemplate';

type OnboardingStep3ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OnboardingStep3'>;

interface Props {
  navigation: OnboardingStep3ScreenNavigationProp;
}

export default function OnboardingStep3Screen({ navigation }: Props) {
  const handleNext = () => {
    navigation.navigate('FinalOnboarding');
  };

  const handleSkip = () => {
    navigation.navigate('FinalOnboarding');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <OnboardingTemplate
      currentStep={3}
      totalSteps={3}
      title="Export & Share Anywhere"
      description="Download high-quality audio files and use them commercially without any restrictions. Share your creations with the world."
      icon="download"
      onNext={handleNext}
      onSkip={handleSkip}
      onBack={handleBack}
      isLastStep={true}
      nextButtonText="Get Started"
    />
  );
}