import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import OnboardingTemplate from '../components/OnboardingTemplate';

type OnboardingStep2ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OnboardingStep2'>;

interface Props {
  navigation: OnboardingStep2ScreenNavigationProp;
}

export default function OnboardingStep2Screen({ navigation }: Props) {
  const handleNext = () => {
    navigation.navigate('OnboardingStep3');
  };

  const handleSkip = () => {
    navigation.navigate('FinalOnboarding');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <OnboardingTemplate
      currentStep={2}
      totalSteps={3}
      title="AI-Powered Music Creation"
      description="Generate custom, royalty-free music that perfectly matches your content in seconds. Choose from various styles and moods."
      icon="musical-notes"
      onNext={handleNext}
      onSkip={handleSkip}
      onBack={handleBack}
    />
  );
}