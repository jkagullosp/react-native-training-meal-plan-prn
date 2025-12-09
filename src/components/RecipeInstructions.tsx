import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { RecipeStep } from '@/types/recipe';

const StepRow = ({ step, index }: { step: RecipeStep; index: number }) => {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepNumber}>{index + 1}</Text>
      </View>
      <View style={styles.stepTextContainer}>
        <Text style={styles.stepText}>{step.instruction}</Text>
      </View>
    </View>
  );
};

const stepRowAreEqual = (prev: any, next: any) =>
  prev.index === next.index &&
  prev.step.step_number === next.step.step_number &&
  prev.step.instruction === next.step.instruction;

const MemoStepRow = memo(StepRow, stepRowAreEqual);

function Instructions({ route }: any) {
  const { recipe } = route.params;

  const sortedSteps = useMemo(() => {
    if (!recipe || !recipe.steps) return [];
    return [...recipe.steps].sort((a, b) => a.step_number - b.step_number);
  }, [recipe]);

  const memoizedStepRows = useMemo(() => {
    return sortedSteps.map((step: RecipeStep, index: number) => (
      <MemoStepRow key={step.id ?? index} step={step} index={index} />
    ));
  }, [sortedSteps]);

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Instructions not available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.instructionsWrapper}>
      {sortedSteps.length > 0 ? (
        memoizedStepRows
      ) : (
        <Text style={styles.noInstructions}>No instructions listed.</Text>
      )}
    </View>
  );
}

export default memo(Instructions, (prev, next) => {
  return (
    JSON.stringify(prev.route.params.recipe) ===
    JSON.stringify(next.route.params.recipe)
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  instructionsWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: '#D3D3D3',
    borderWidth: 1,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  stepHeader: {
    width: 28,
    height: 28,
    backgroundColor: '#E16235',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  noInstructions: {
    textAlign: 'center',
    padding: 16,
    color: '#888',
    fontStyle: 'italic',
  },
});
