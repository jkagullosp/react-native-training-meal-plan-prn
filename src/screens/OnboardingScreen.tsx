import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { ChefHat, ShoppingBasket, Calendar1 } from "lucide-react-native";
import { onboarding_texts } from "@/constants/constants";

const { width } = Dimensions.get("window");

const slides = [
  {
    image: require("@assets/images/onboardImage1.jpg"),
    title: onboarding_texts.screen1.title,
    subtitle: onboarding_texts.screen1.subtitle,
    Icon: ChefHat
  },
  {
    image: require("@assets/images/onboardImage2.jpg"),
    title: onboarding_texts.screen2.title,
    subtitle: onboarding_texts.screen2.subtitle,
    Icon: Calendar1
  },
  {
    image: require("@assets/images/onboardImage3.jpg"),
    title: onboarding_texts.screen3.title,
    subtitle: onboarding_texts.screen3.subtitle,
    Icon: ShoppingBasket
  },
];

export default function OnboardingScreen({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const carouselRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        width={width}
        height={500}
        data={slides}
        scrollAnimationDuration={600}
        onSnapToItem={(index) => setCurrentIndex(index)}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image style={styles.image} source={item.image} />
              <View style={styles.iconContainer}>
                <item.Icon size={40} color="#E16235" />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.indicatorContainer}>
        {slides.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.indicator,
              currentIndex === idx && styles.activeIndicator,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (currentIndex === slides.length - 1) {
            onFinish();
          } else {
            carouselRef.current?.scrollTo({
              index: currentIndex + 1,
              animated: true,
            });
          }
        }}
      >
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
  },
  image: {
    height: 200,
    width: 300,
    borderRadius: 16,
  },
  iconContainer: {
    position: "absolute",
    bottom: -25,
    left: 185,
    width: 80,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#777777",
    marginBottom: 50,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  indicator: {
    height: 10,
    width: 10,
    backgroundColor: "#d9d9d9",
    borderRadius: 50,
  },
  activeIndicator: {
    width: 40,
    backgroundColor: "#E16235",
  },
  button: {
    padding: 10,
    backgroundColor: "#E16235",
    marginHorizontal: 50,
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
