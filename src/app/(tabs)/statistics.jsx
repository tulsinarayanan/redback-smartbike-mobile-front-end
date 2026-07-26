import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const mockData = [
  { day: 'Mon', minutes: 22 },
  { day: 'Tue', minutes: 48 },
  { day: 'Wed', minutes: 26 },
  { day: 'Thu', minutes: 55 },
  { day: 'Fri', minutes: 99 },
  { day: 'Sat', minutes: 35 },
  { day: 'Sun', minutes: 20 },
];

const caloriesData = [
  { day: 'Mon', calories: 180 },
  { day: 'Tue', calories: 320 },
  { day: 'Wed', calories: 210 },
  { day: 'Thu', calories: 390 },
  { day: 'Fri', calories: 540 },
  { day: 'Sat', calories: 260 },
  { day: 'Sun', calories: 170 },
];

const workoutSummary = {
  totalDistance: '92.4 km',
  calories: 3250,
  avgHeartRate: '148 bpm',
  longestRide: '99 min',
};

const recentWorkouts = [
  { id: 1, title: 'Morning Ride', duration: '35 min', calories: '280 cal' },
  { id: 2, title: 'Hill Climb', duration: '42 min', calories: '360 cal' },
  { id: 3, title: 'Recovery Ride', duration: '20 min', calories: '140 cal' },
];

export default function RedbackWeeklySummary() {
  const { width: screenWidth } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [rideData, setRideData] = useState([]);
  const [selectedChart, setSelectedChart] = useState('Minutes');

  useEffect(() => {
    const timer = setTimeout(() => {
      setRideData(mockData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const totalMinutes = rideData.reduce((sum, d) => sum + d.minutes, 0);
  const activeDays = rideData.filter((d) => d.minutes > 0).length;

  const bestDay =
    rideData.length > 0
      ? rideData.reduce((prev, current) =>
          current.minutes > prev.minutes ? current : prev
        )
      : null;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const formattedTotalTime = `${hours}h ${minutes}m`;

  const minutesLineData = rideData.map((item) => ({
    value: item.minutes,
    label: item.day,
  }));

  const caloriesLineData = caloriesData.map((item) => ({
    value: item.calories,
    label: item.day,
  }));

  const currentLineData =
    selectedChart === 'Minutes' ? minutesLineData : caloriesLineData;

  const chartCardHorizontalPadding = 18;
  const chartWidth = screenWidth - 30 - chartCardHorizontalPadding * 2;

  const pointCount = currentLineData.length;
  const usableSpacing =
    pointCount > 1 ? chartWidth / (pointCount - 1) : chartWidth;

  const spacing = Math.min(Math.max(usableSpacing, 35), 65);

  const peakPoint =
    currentLineData.length > 0
      ? currentLineData.reduce((prev, current) =>
          current.value > prev.value ? current : prev
        )
      : null;

  const chartColor = selectedChart === 'Minutes' ? '#ffffff' : '#FFD700';
  const tabActiveColor = selectedChart === 'Minutes' ? '#3A0A50' : '#FFD700';
  const tabActiveTextColor = selectedChart === 'Minutes' ? '#fff' : '#3A0A50';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Track your stats</Text>
            <Text style={styles.subtitle}>Weekly SmartBike ride progress</Text>
          </View>

          <MaterialIcons name="insert-chart" size={30} color="#3A0A50" style={styles.headerIcon} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3A0A50" style={styles.loader} />
        ) : (
          <>
            <View style={styles.cardGrid}>
              <LinearGradient
                colors={['#ffaaa8', '#ff3838']}
                style={styles.summaryCard}
              >
                <FontAwesome5 name="biking" size={24} color="#ffffff" />
                <Text style={styles.cardLabel}>Distance</Text>
                <Text style={styles.cardValue}>{workoutSummary.totalDistance}</Text>
              </LinearGradient>

              <LinearGradient
                colors={['#bcb8f0', '#5b5be0']}
                style={styles.summaryCard}
              >
                <MaterialCommunityIcons name="fire" size={26} color="#ffffff" />
                <Text style={styles.cardLabel}>Calories</Text>
                <Text style={styles.cardValue}>{workoutSummary.calories}</Text>
              </LinearGradient>

              <LinearGradient
                colors={['#ffd4a3', '#ff9100']}
                style={styles.summaryCard}
              >
                <MaterialIcons name="favorite" size={26} color="#ffffff" />
                <Text style={styles.cardLabel}>Avg Heart Rate</Text>
                <Text style={styles.cardValue}>{workoutSummary.avgHeartRate}</Text>
              </LinearGradient>

              <LinearGradient
                colors={['#f5b3d5', '#ee56aa']}
                style={styles.summaryCard}
              >
                <MaterialIcons name="timer" size={26} color="#ffffff" />
                <Text style={styles.cardLabel}>Longest Ride</Text>
                <Text style={styles.cardValue}>{workoutSummary.longestRide}</Text>
              </LinearGradient>
            </View>

            <LinearGradient
              colors={['#2bb8ad', '#2bb8ad']}
              style={styles.chartCard}
            >
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Ride Trends</Text>

                <View style={styles.chartTabs}>
                  {['Minutes', 'Calories'].map((tab) => {
                    const isActive = selectedChart === tab;

                    return (
                      <TouchableOpacity
                        key={tab}
                        onPress={() => setSelectedChart(tab)}
                        style={[
                          styles.chartTab,
                          isActive && { backgroundColor: tabActiveColor },
                        ]}
                      >
                        <Text
                          style={[
                            styles.chartTabText,
                            isActive && { color: tabActiveTextColor },
                          ]}
                        >
                          {tab}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.chartInner}>
                <LineChart
                  data={currentLineData}
                  curved
                  thickness={3}
                  color={chartColor}
                  hideDataPoints={false}
                  dataPointsColor={chartColor}
                  dataPointsRadius={4}
                  yAxisColor="rgba(255,255,255,0.45)"
                  xAxisColor="rgba(255,255,255,0.45)"
                  rulesColor="rgba(255,255,255,0.25)"
                  yAxisTextStyle={{ color: '#ffffff', fontWeight: '700' }}
                  xAxisLabelTextStyle={{ color: '#ffffff', fontWeight: '700' }}
                  backgroundColor="transparent"
                  noOfSections={4}
                  maxValue={selectedChart === 'Minutes' ? 120 : 600}
                  width={chartWidth}
                  spacing={spacing}
                  initialSpacing={25}
                  endSpacing={10}
                  isAnimated
                  animateOnDataChange
                  hideOrigin
                  pointerConfig={{
                    pointerStripHeight: 160,
                    pointerStripColor: chartColor,
                    pointerStripWidth: 1,
                    pointerColor: chartColor,
                    radius: 6,
                    pointerLabelWidth: 90,
                    pointerLabelHeight: 50,
                    activatePointersOnLongPress: true,
                    autoAdjustPointerLabelPosition: true,
                    pointerLabelComponent: (items) => {
                      const item = items?.[0];

                      if (!item) {
                        return null;
                      }

                      return (
                        <View style={styles.pointerBox}>
                          <Text style={styles.pointerTitle}>{item.label}</Text>
                          <Text style={styles.pointerValue}>
                            {item.value} {selectedChart === 'Minutes' ? 'min' : 'cal'}
                          </Text>
                        </View>
                      );
                    },
                  }}
                />
              </View>

              <Text style={styles.chartInsight}>
                {peakPoint
                  ? `Peak ${selectedChart.toLowerCase()} was ${peakPoint.value} on ${peakPoint.label}`
                  : 'No chart data available'}
              </Text>
            </LinearGradient>

            <View style={styles.infoGrid}>
              <LinearGradient
                colors={['#edc3a8', '#d56a20']}
                style={styles.infoCard}
              >
                <MaterialIcons name="schedule" size={24} color="#ffffff" />
                <Text style={styles.infoLabel}>Total Ride Time</Text>
                <Text style={styles.infoValue}>{formattedTotalTime}</Text>
              </LinearGradient>

              <LinearGradient
                colors={['#c8f4c8', '#4bd864']}
                style={styles.infoCard}
              >
                <MaterialIcons name="event-available" size={24} color="#ffffff" />
                <Text style={styles.infoLabel}>Active Days</Text>
                <Text style={styles.infoValue}>{activeDays} days</Text>
              </LinearGradient>
            </View>

            <LinearGradient
              colors={['#a8c9ff', '#168cff']}
              style={styles.motivationBox}
            >
              <Text style={styles.motivation}>
                {bestDay
                  ? `Your strongest day was ${bestDay.day} with ${bestDay.minutes} minutes.`
                  : 'Keep pushing to hit your weekly targets.'}
              </Text>
            </LinearGradient>

            <View style={styles.recentBox}>
              <Text style={styles.recentTitle}>Recent Workouts</Text>

              {recentWorkouts.map((workout) => (
                <View key={workout.id} style={styles.workoutRow}>
                  <View>
                    <Text style={styles.workoutName}>{workout.title}</Text>
                    <Text style={styles.workoutDuration}>{workout.duration}</Text>
                  </View>

                  <Text style={styles.workoutCalories}>{workout.calories}</Text>
                </View>
              ))}
            </View>

            <View style={styles.recentBox}>
              <Text style={styles.recentTitle}>Recent Workouts</Text>

              {recentWorkouts.map((workout) => (
                <View key={workout.id} style={styles.workoutRow}>
                  <View>
                    <Text style={styles.workoutName}>{workout.title}</Text>
                    <Text style={styles.workoutDuration}>{workout.duration}</Text>
                  </View>

                  <Text style={styles.workoutCalories}>{workout.calories}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: StatusBar.currentHeight || 20,
  },
  container: {
    paddingHorizontal: 15,
    paddingBottom: 40,
    backgroundColor: '#ffffff',
  },
  loader: {
    marginTop: 40,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 28,
  },
  loader: {
    marginTop: 40,
  },
  title: {
    fontSize: 39,
    fontWeight: '900',
    color: '#3A0A50',
    lineHeight: 46,
  },
  subtitle: {
    fontSize: 15,
    color: '#6F5B7B',
    fontWeight: '600',
    marginTop: 6,
  },
  headerIcon: {
    fontSize: 30,
    marginTop: 6,
  },
  cardGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    width: '48.5%',
    minHeight: 125,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  cardValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  chartCard: {
    width: '100%',
    borderRadius: 18,
    padding: 18,
    marginTop: 4,
    marginBottom: 18,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  chartTitle: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '900',
  },
  chartTabs: {
    flexDirection: 'row',
  },
  chartTab: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginLeft: 8,
  },
  chartTabText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  chartInner: {
    marginTop: 4,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartInsight: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 14,
  },
  infoGrid: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoCard: {
    width: '48.5%',
    borderRadius: 18,
    padding: 16,
    minHeight: 115,
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  infoValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  motivationBox: {
    padding: 18,
    borderRadius: 18,
    width: '100%',
    marginBottom: 18,
  },
  motivation: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 17,
    textAlign: 'center',
  },
  recentBox: {
    backgroundColor: '#f3f0f7',
    padding: 16,
    borderRadius: 18,
    width: '100%',
  },
  recentTitle: {
    color: '#3A0A50',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
  },
  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#ded7e8',
  },
  workoutName: {
    color: '#3A0A50',
    fontSize: 16,
    fontWeight: '800',
  },
  workoutDuration: {
    color: '#7A6A85',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  workoutCalories: {
    color: '#3A0A50',
    fontWeight: '900',
    fontSize: 14,
  },
  pointerBox: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  pointerTitle: {
    color: '#6F5B7B',
    fontSize: 12,
    marginBottom: 2,
    fontWeight: '700',
  },
  pointerValue: {
    color: '#3A0A50',
    fontWeight: '900',
    fontSize: 14,
  },
});
