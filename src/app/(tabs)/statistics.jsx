import React, { useCallback, useContext, useEffect, useState } from 'react';
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
import { useFocusEffect } from 'expo-router';
import { LineChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AuthContext } from '@/context/authContext';
import { useTheme } from '@/context/themeContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

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

const recentMock = [
  { id: 1, title: 'Morning Ride', duration: '35 min', calories: '280 cal' },
  { id: 2, title: 'Hill Climb', duration: '42 min', calories: '360 cal' },
  { id: 3, title: 'Recovery Ride', duration: '20 min', calories: '140 cal' },
];

export default function RedbackWeeklySummary() {
  const { width: screenWidth } = useWindowDimensions();
  const { isDark, toggle } = useTheme();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [rideData, setRideData] = useState([]);
  const [calData, setCalData] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState(recentMock);
  const [workoutSummary, setWorkoutSummary] = useState({
    totalDistance: '92.4 km',
    calories: 3250,
    avgHeartRate: '148 bpm',
    longestRide: '99 min',
  });
  const [selectedChart, setSelectedChart] = useState('Minutes');
  const [error, setError] = useState(null);

  const fetchRides = useCallback(async () => {
    if (!user?.id || !API_BASE_URL) {
      // fallback to mock — keep UI light, no 1s artificial delay
      setRideData(mockData);
      setCalData(caloriesData);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      setLoading(true);
      setError(null);
      const url = `${API_BASE_URL.replace(/\/$/, '')}/api/rides?user_id=${encodeURIComponent(user.id)}&limit=20`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const rides = await res.json();

      if (!Array.isArray(rides) || rides.length === 0) {
        setRideData(mockData);
        setCalData(caloriesData);
        setRecentWorkouts(recentMock);
        setWorkoutSummary({
          totalDistance: '0.0 km',
          calories: 0,
          avgHeartRate: '—',
          longestRide: '0 min',
        });
        return;
      }

      // Build per-day aggregates for last 7 days (Mon-Sun)
      const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayMap = Object.fromEntries(dayOrder.map((d) => [d, { minutes: 0, calories: 0 }]));
      let totalDist = 0;
      let totalCals = 0;
      let maxDur = 0;
      const recents = [];

      rides.forEach((r) => {
        const mins = Math.round((Number(r.duration) || 0) / 60) || Math.round((Number(r.duration) || 0));
        // if duration already in minutes (<200), keep as is; else convert seconds
        const minsNorm = (r.duration > 200 ? Math.round(r.duration / 60) : r.duration) || 0;
        // Actually rides.duration is seconds; convert to minutes
        const minutes = Math.round((Number(r.duration) || 0) / 60);
        const cals = Math.round(Number(r.calories) || 0);
        totalDist += Number(r.distance) || 0;
        totalCals += cals;
        if (minutes > maxDur) maxDur = minutes;

        // bucket by weekday of start_time
        try {
          const d = new Date(r.start_time);
          const jsDay = d.getDay(); // 0 Sun
          const map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const label = map[jsDay];
          if (dayMap[label]) {
            dayMap[label].minutes += minutes;
            dayMap[label].calories += cals;
          }
        } catch {}

        // recent list
        recents.push({
          id: r.ride_id,
          title: `Ride • ${new Date(r.start_time).toLocaleDateString()}`,
          duration: `${minutes} min`,
          calories: `${cals} cal`,
          raw: r,
        });
      });

      const dayData = dayOrder.map((d) => ({ day: d, minutes: dayMap[d].minutes }));
      const calDayData = dayOrder.map((d) => ({ day: d, calories: dayMap[d].calories }));

      setRideData(dayData);
      setCalData(calDayData);
      setRecentWorkouts(recents.slice(0, 5));
      setWorkoutSummary({
        totalDistance: `${totalDist.toFixed(1)} km`,
        calories: totalCals,
        avgHeartRate: '—',
        longestRide: `${maxDur} min`,
      });
    } catch (e) {
      clearTimeout(timeout);
      const isAbort = e?.name === 'AbortError';
      setError(isAbort ? 'Stats timed out — backend unreachable' : 'Offline — showing demo stats');
      setRideData(mockData);
      setCalData(caloriesData);
      setRecentWorkouts(recentMock);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  useFocusEffect(
    useCallback(() => {
      fetchRides();
    }, [fetchRides])
  );

  const totalMinutes = rideData.reduce((sum, d) => sum + (d.minutes || 0), 0);
  const activeDays = rideData.filter((d) => (d.minutes || 0) > 0).length;

  const bestDay =
    rideData.length > 0
      ? rideData.reduce((prev, current) =>
          (current.minutes || 0) > (prev.minutes || 0) ? current : prev
        )
      : null;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const formattedTotalTime = `${hours}h ${minutes}m`;

  const minutesLineData = rideData.map((item) => ({
    value: item.minutes,
    label: item.day,
  }));

  const caloriesLineData = calData.map((item) => ({
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
    <SafeAreaView style={[styles.safeArea, isDark && { backgroundColor: '#0B0F1A' }]}>
      <ScrollView contentContainerStyle={[styles.container, isDark && { backgroundColor: '#0B0F1A' }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, isDark && { color: 'white' }]}>Track your stats</Text>
            <Text style={[styles.subtitle, isDark && { color: '#9CA3AF' }]}>Weekly SmartBike ride progress</Text>
          </View>

          <TouchableOpacity
            onPress={toggle}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: isDark ? '#1D2432' : '#f3f0f7',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: isDark ? '#2A3446' : '#ded7e8',
              marginLeft: 12,
            }}
          >
            <MaterialIcons name={isDark ? 'light-mode' : 'dark-mode'} size={20} color={isDark ? '#EB7363' : '#3A0A50'} />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={{ backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#991b1b', fontSize: 12, flex: 1, marginRight: 8 }}>{error}</Text>
            <TouchableOpacity onPress={fetchRides} style={{ backgroundColor: '#3A0A50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={isDark ? "#EB7363" : "#3A0A50"} style={styles.loader} />
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
                  maxValue={selectedChart === 'Minutes' ? Math.max(120, Math.ceil((peakPoint?.value || 0) * 1.2)) : Math.max(600, Math.ceil((peakPoint?.value || 0) * 1.2))}
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

            <View style={[styles.recentBox, isDark && { backgroundColor: '#141A26', borderWidth: 1, borderColor: '#1F2937' }]}>
              <Text style={[styles.recentTitle, isDark && { color: 'white' }]}>Recent Workouts</Text>

              {recentWorkouts.map((workout) => (
                <View key={workout.id} style={[styles.workoutRow, isDark && { borderBottomColor: '#1F2937' }]}>
                  <View>
                    <Text style={[styles.workoutName, isDark && { color: 'white' }]}>{workout.title}</Text>
                    <Text style={[styles.workoutDuration, isDark && { color: '#9CA3AF' }]}>{workout.duration}</Text>
                  </View>

                  <Text style={[styles.workoutCalories, isDark && { color: '#EB7363' }]}>{workout.calories}</Text>
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
