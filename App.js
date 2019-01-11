import * as React from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { Constants, FileSystem, Asset, SQLite } from 'expo';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fontLoaded: false,
      downloaded: false,

      name: '7',
      country: '7',
      year: '7',
      type: '7',
      timer: 60,
    };
  }

  componentDidMount() {
    // Trigger downloading the database.
    // Ideally we would probably put this whole downloading database code
    // into a promise passed to AppLoading (https://docs.expo.io/versions/v28.0.0/sdk/app-loading)
    this.downloadDatabase();
  }

  downloadDatabase = async () => {
    const sqliteDirectory = `${FileSystem.documentDirectory}SQLite`;

    // First, ensure that the SQLite directory is indeed a directory
    // For that we will first get information about the filesystem node
    // and handle non-existent scenario.
    const { exists, isDirectory } = await FileSystem.getInfoAsync(
      sqliteDirectory
    );
    if (!exists) {
      await FileSystem.makeDirectoryAsync(sqliteDirectory);
    } else if (!isDirectory) {
      throw new Error('SQLite dir is not a directory');
    }

    const pathToDownloadTo = `${sqliteDirectory}/test.db`;
    const uriToDownload = Asset.fromModule(require('./assets/db/noWordDataBase.db'))
      .uri;
    console.log(`Will download ${uriToDownload} to ${pathToDownloadTo}`);

    // Let's download the file! We could have used something like
    // https://github.com/expo/native-component-list/blob/3f03acb7e11a1b0cc0c33036743465aaae5c2cf1/screens/FileSystemScreen.js#L27-L44
    // i. e. some progress indicator, but hey, that's just a demo!
    await FileSystem.downloadAsync(uriToDownload, pathToDownloadTo);
    this.db = SQLite.openDatabase('test.db');
    // Once we've opened the database and saved the instance to `this`, we can enable the open button.
    this.setState({ downloaded: true });
  };

  showTables = rows => {
    const message = JSON.stringify(rows);
    alert('Success:' + message);
  };

  loadDB = () => {
    console.log('about to open db');
    this.db.transaction(
      tx => {
        tx.executeSql(
          `SELECT name FROM dataBaseCsv WHERE type='مسلسل' LIMIT 1`,
          //   `SELECT * FROM states LIMIT 5`,
          [],
          (_, { rows }) => this.showTables(rows),
          (txObj, error) => alert(error)
        );
      },
      error => console.log('something went wrong:' + error),
      () => console.log('db transaction is a success')
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>
          {this.state.type}
        </Text>
        <Text style={styles.paragraph}>
          {this.state.name}
        </Text>
        <Text style={styles.paragraph}>
          {this.state.country}
        </Text>
        <Text style={styles.paragraph}>
          {this.state.year}
        </Text>
        <Button
          onPress={() => this.loadDB()}
          title={this.state.downloaded ? 'Click here' : 'Downloading...'}
          disabled={!this.state.downloaded}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
