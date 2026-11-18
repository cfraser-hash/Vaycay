import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


export default function Search() {
  return (
    <ScrollView style={styles.background}>
      <View style={styles.container}>

        <Text style={styles.title}>Plan Your Trip</Text>

        <Text style={styles.subtitle}>
          Tell us what you're looking for and we'll help you find it.
        </Text>

        {/* Destination */}

        <Text style={styles.heading}>Where do you want to go?</Text>

        <TextInput
          style={styles.input}
          placeholder="Search a destination..."
          placeholderTextColor="#888"
        />

        {/* Number of Travelers */}

        <Text style={styles.heading}>How many travelers are attending this trip?</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter number of travelers..."
          placeholderTextColor="#888"
        />

        {/* Budget */}

        <Text style={styles.heading}>What's your budget per person?</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your budget"
          placeholderTextColor="#888"
          keyboardType="numeric"
        />

        {/* Activities */}

        <Text style={styles.heading}>What are you interested in?</Text>

        <View style={styles.activityContainer}>

          <TouchableOpacity style={styles.activityButton}>
            <Text style={styles.activityText}> Beach</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityButton}>
            <Text style={styles.activityText}> Adventure</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityButton}>
            <Text style={styles.activityText}> Food</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityButton}>
            <Text style={styles.activityText}> Culture</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityButton}>
            <Text style={styles.activityText}> Nightlife</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityButton}>
            <Text style={styles.activityText}> Nature</Text>
          </TouchableOpacity>
        </View>

        {/* Trip Length */}

        <Text style={styles.heading}>How long is your trip?</Text>

        <TextInput
          style={styles.input}
          placeholder="Example: 5 days"
          placeholderTextColor="#888"
          keyboardType="numeric"
        />

        {/* Search Button */}

        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchText}>
            Generate My Trip
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#176B58',
  },

  container: {
    padding: 25,
    paddingTop: 50,
    paddingBottom: 100,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },

  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },

  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },

  activityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  activityButton: {
    backgroundColor: 'grey',
    padding: 12,
    borderRadius: 20,
  },

  activityText: {
    color: 'white',
    fontSize: 15,
  },

  searchButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginTop: 35,
    alignItems: 'center',
  },

  searchText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#262627',
  },
});