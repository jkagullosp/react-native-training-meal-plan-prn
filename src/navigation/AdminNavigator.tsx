import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Briefcase, Check, Verified } from 'lucide-react-native';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AdminManagementScreen from '@/screens/AdminManagementScreen';
import AdminContentScreen from '@/screens/AdminContentScreen';
import AdminCreateRecipeScreen from '@/screens/AdminCreateRecipe';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#E16235',
        tabBarInactiveTintColor: '#999999',
        tabBarIcon: ({ color, size }) => {
          if (Platform.OS === 'ios') {
            let iconName = 'home';
            if (route.name === 'Management') iconName = 'briefcase';
            if (route.name === 'Approvals') iconName = 'check';
            if (route.name === 'Create') iconName = 'shield-check';
            return <Icon name={iconName} size={size} color={color} />;
          } else {
            if (route.name === 'Management')
              return <Briefcase color={color} size={size} />;
            if (route.name === 'Approvals')
              return <Check color={color} size={size} />;
            if (route.name === 'Create')
              return <Verified color={color} size={size} />;
            return null;
          }
        },
      })}
    >
      <Tab.Screen name="Management" component={AdminManagementScreen} />
      <Tab.Screen name="Approvals" component={AdminContentScreen} />
      <Tab.Screen name="Create" component={AdminCreateRecipeScreen} />
    </Tab.Navigator>
  );
}
