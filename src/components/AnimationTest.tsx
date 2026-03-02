/**
 * Animation Test Component
 * Demonstrates Framer Motion integration for UI animations
 * Requirements: 12.4 - Smooth transitions with 300ms duration
 */

import { motion } from 'framer-motion';

export const AnimationTest = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-deep-space text-star-white p-4 rounded-lg"
    >
      <h2 className="text-2xl font-sans">Animation Test</h2>
      <p className="text-sm mt-2">Framer Motion is configured and working!</p>
    </motion.div>
  );
};
