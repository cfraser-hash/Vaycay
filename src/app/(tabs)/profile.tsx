import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function Profile() {

  // Temporary user data
  // Later, this will come from your login/database
  const user = {
    name: 'Your Name',
    username: 'username',
    bio: 'Tell people a little about yourself.',
    profilePicture: require('@/assets/images/profile-picture.png'),
    coverPhoto: require('@/assets/images/profile-cover.png'),

    trips: 0,
    posts: 0,
    saved: 0,
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* COVER PHOTO */}
      <View style={styles.coverContainer}>
        <Image
          source={user.coverPhoto}
          style={styles.coverPhoto}
        />
      </View>


      {/* PROFILE PICTURE */}
      <View style={styles.profilePictureContainer}>

        <Image
          source={user.profilePicture}
          style={styles.profilePicture}
        />

        {/* Camera Button */}
        <TouchableOpacity style={styles.cameraButton}>
          <Text style={styles.cameraText}>+</Text>
        </TouchableOpacity>

      </View>


      {/* PROFILE INFORMATION */}
      <View style={styles.profileInfo}>

        <View style={styles.nameRow}>

          <View style={styles.userText}>

            <Text style={styles.name}>
              {user.name}
            </Text>

            <Text style={styles.username}>
              @{user.username}
            </Text>

          </View>


          {/* EDIT PROFILE */}
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editText}>
              ✎ Edit Profile
            </Text>
          </TouchableOpacity>

        </View>


        {/* BIO */}
        <Text style={styles.bio}>
          {user.bio}
        </Text>

      </View>


      {/* PROFILE STATS */}
      <View style={styles.stats}>

        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {user.trips}
          </Text>

          <Text style={styles.statLabel}>
            Trips
          </Text>
        </View>


        <View style={styles.divider} />


        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {user.posts}
          </Text>

          <Text style={styles.statLabel}>
            Posts
          </Text>
        </View>


        <View style={styles.divider} />


        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {user.saved}
          </Text>

          <Text style={styles.statLabel}>
            Saved
          </Text>
        </View>

      </View>


      {/* MY TRIPS */}
      <View style={styles.sectionHeader}>

        <Text style={styles.sectionTitle}>
          My Trips
        </Text>

        <TouchableOpacity>
          <Text style={styles.seeAll}>
            See All ›
          </Text>
        </TouchableOpacity>

      </View>


      {/* EMPTY TRIPS MESSAGE */}
      <View style={styles.emptyTrips}>

        <Text style={styles.emptyTitle}>
          No trips yet
        </Text>

        <Text style={styles.emptyText}>
          Start planning your next adventure!
        </Text>

        <TouchableOpacity style={styles.createTripButton}>
          <Text style={styles.createTripText}>
            + Create Trip
          </Text>
        </TouchableOpacity>

      </View>


      {/* EXTRA SPACE FOR FLOATING TAB BAR */}
      <View style={{ height: 120 }} />

    </ScrollView>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: 'white',
  },


  // -------------------------
  // COVER PHOTO
  // -------------------------

  coverContainer: {
    width: '100%',
    height: 220,
  },

  coverPhoto: {
    width: '100%',
    height: '100%',
  },


  // -------------------------
  // PROFILE PICTURE
  // -------------------------

  profilePictureContainer: {
    marginTop: -65,
    marginLeft: 25,
    width: 130,
    height: 130,
  },

  profilePicture: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 5,
    borderColor: 'white',
  },

  cameraButton: {
    position: 'absolute',
    right: -5,
    bottom: 0,

    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: 'lightblue',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 3,
    borderColor: 'white',
  },

  cameraText: {
    fontSize: 17,
  },


  // -------------------------
  // PROFILE INFORMATION
  // -------------------------

  profileInfo: {
    paddingHorizontal: 25,
    marginTop: 15,
  },

  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  userText: {
    flex: 1,
  },

  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#102A43',
  },

  username: {
    fontSize: 16,
    color: '#7A8793',
    marginTop: 3,
  },

  bio: {
    fontSize: 17,
    color: '#34495E',
    lineHeight: 25,
    marginTop: 15,
  },


  // -------------------------
  // EDIT PROFILE
  // -------------------------

  editButton: {
    borderWidth: 1,
    borderColor: '#B8C4CC',

    borderRadius: 12,

    paddingVertical: 10,
    paddingHorizontal: 15,

    marginLeft: 10,
  },

  editText: {
    fontSize: 15,
    color: '#34495E',
    fontWeight: '600',
  },


  // -------------------------
  // STATS
  // -------------------------

  stats: {
    flexDirection: 'row',

    justifyContent: 'space-around',
    alignItems: 'center',

    marginTop: 30,

    paddingHorizontal: 20,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#102A43',
  },

  statLabel: {
    fontSize: 15,
    color: '#7A8793',
    marginTop: 3,
  },

  divider: {
    width: 1,
    height: 45,
    backgroundColor: '#D9E0E5',
  },


  // -------------------------
  // MY TRIPS
  // -------------------------

  sectionHeader: {
    flexDirection: 'row',

    justifyContent: 'space-between',
    alignItems: 'center',

    paddingHorizontal: 25,

    marginTop: 40,
  },

  sectionTitle: {
    fontSize: 27,
    fontWeight: 'bold',
    color: 'black',
  },

  seeAll: {
    fontSize: 16,
    fontWeight: '600',
    color: 'lightblue',
  },


  // -------------------------
  // NO TRIPS
  // -------------------------

  emptyTrips: {
    alignItems: 'center',

    marginTop: 30,
    marginHorizontal: 25,

    paddingVertical: 40,

    borderRadius: 15,

    backgroundColor: 'lightgrey',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },

  emptyText: {
    marginTop: 8,

    fontSize: 15,
    color: 'black',

    textAlign: 'center',
  },

  createTripButton: {
    marginTop: 20,

    backgroundColor: 'lightblue',

    paddingVertical: 11,
    paddingHorizontal: 20,

    borderRadius: 10,
  },

  createTripText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },

});