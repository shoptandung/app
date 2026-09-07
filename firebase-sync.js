/* Firebase Realtime Database bridge for the key generator and optimizer app. */
window.FF_FIREBASE_CONFIG = {
    apiKey: 'AIzaSyD4KYRvR4GJkBfXh6vkrcY3qXe_-HwkAus',
    authDomain: 'ff-optimizer-sync.firebaseapp.com',
    databaseURL: 'https://ff-optimizer-sync-default-rtdb.firebaseio.com',
    projectId: 'ff-optimizer-sync',
    storageBucket: 'ff-optimizer-sync.firebasestorage.app',
    messagingSenderId: '395525135',
    appId: '1:395525135:web:724225d11e751e943c777a',
    measurementId: 'G-7RXX6CK5C8'
};

window.FirebaseKeySync = {
    path: 'ff_optimizer/keygen',
    database: null,
    initialized: false,
    listener: null,

    isConfigured() {
        const config = window.FF_FIREBASE_CONFIG || {};
        return Boolean(
            window.firebase &&
            config.apiKey &&
            !config.apiKey.startsWith('PASTE_') &&
            config.databaseURL &&
            !config.databaseURL.includes('PASTE_FIREBASE_PROJECT')
        );
    },

    init(onData) {
        if (!this.isConfigured()) return false;
        try {
            if (!firebase.apps.length) firebase.initializeApp(window.FF_FIREBASE_CONFIG);
            this.database = firebase.database();
            this.listener = this.database.ref(this.path);
            this.listener.on('value', (snapshot) => {
                const value = snapshot.val();
                if (value && Array.isArray(value.keys)) onData(value.keys, value.updatedAt || 0);
            });
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('[Firebase] Init error:', error);
            return false;
        }
    },

    save(keys) {
        if (!this.initialized || !this.database || !Array.isArray(keys)) return Promise.resolve(false);
        return this.database.ref(this.path).set({
            keys: keys,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        }).then(() => true).catch((error) => {
            console.error('[Firebase] Save error:', error);
            return false;
        });
    }
};
