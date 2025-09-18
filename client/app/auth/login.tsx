import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { FormInput } from '../../components/FormInput';
import { GradientButton } from '../../components/GradientButton';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});

    // Validate
    if (!username) {
      setErrors(prev => ({ ...prev, username: 'Username is required' }));
      return;
    }
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setLoading(true);
    const response = await apiClient.login({ username, password });
    setLoading(false);

    if (response.success && response.data) {
      // Set user in context
      setUser(response.data);
      // Navigate to home screen
      router.replace('/home');
    } else {
      window.alert(`Login Failed: ${response.message || 'Please check your credentials'}`);

    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoid}
    >
      <LinearGradient
        colors={["#FFF5E6", "#FFE0CC", "#FFDAB9"]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>We are so happy to see you again 💛</Text>
        </View>

        <View style={styles.formContainer}>
          <FormInput
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            error={errors.username}
          />

          <FormInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <GradientButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity 
            style={styles.signupButton} 
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={styles.signupButtonText}>Create New Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.decorativeCircles}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#5D4037',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8D6E63',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 350,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0B599',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#8D6E63',
    fontSize: 14,
  },
  signupButton: {
    borderWidth: 2,
    borderColor: '#FF8E53',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  decorativeCircles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: '#FFB74D',
    top: -100,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#FF8A65',
    bottom: 50,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: '#FFAB91',
    top: '40%',
    right: -20,
  },
});
