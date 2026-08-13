import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with specific databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Helper for Google Sign-In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Save or update user profile in Firestore
    await saveUserProfile(user.uid, {
      uid: user.uid,
      name: user.displayName || 'User',
      email: user.email || '',
      phone: user.phoneNumber || '',
      photoURL: user.photoURL || '',
      state: 'Karnataka', // Default or user prompt
      updatedAt: new Date().toISOString()
    });

    return user;
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

// Helper for Email / Password Registration
export const registerWithEmail = async (email: string, pass: string, name: string, phone?: string, state?: string) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const user = res.user;
    if (name) {
      await updateProfile(user, { displayName: name });
    }

    const profileData = {
      uid: user.uid,
      name: name || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      phone: phone || '',
      state: state || 'Karnataka',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveUserProfile(user.uid, profileData);
    return user;
  } catch (error: any) {
    console.error("Email Registration Error:", error);
    throw error;
  }
};

// Helper for Email / Password Login
export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return res.user;
  } catch (error: any) {
    console.error("Email Login Error:", error);
    throw error;
  }
};

// Helper for Sign Out
export const logoutFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Sign Out Error:", error);
    throw error;
  }
};

// Listen to Auth State Changes
export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// --- FIRESTORE USER PROFILE API ---

export const saveUserProfile = async (uid: string, data: any) => {
  try {
    const userRef = doc(db, 'users', uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        uid,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        state: data.state || 'Karnataka',
        photoURL: data.photoURL || '',
        savedTreesCount: 0,
        completedDocsCount: 0,
        upcomingAppointments: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      await setDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (error) {
    console.error("Error saving user profile:", error);
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// --- FIRESTORE FAMILY TREES ---

export const saveFamilyTreeToFirestore = async (uid: string, treeData: any) => {
  try {
    const treesRef = collection(db, 'users', uid, 'familyTrees');
    const docData = {
      ...treeData,
      id: treeData.id || `tree_${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    const docRef = doc(treesRef, docData.id);
    await setDoc(docRef, docData, { merge: true });
    
    // Update count on user profile
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentCount = userSnap.data()?.savedTreesCount || 0;
      await setDoc(userRef, { savedTreesCount: Math.max(currentCount, 1) }, { merge: true });
    }
    return docData;
  } catch (error) {
    console.error("Error saving family tree:", error);
    throw error;
  }
};

export const getFamilyTreesFromFirestore = async (uid: string) => {
  try {
    const treesRef = collection(db, 'users', uid, 'familyTrees');
    const snap = await getDocs(treesRef);
    return snap.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error getting family trees:", error);
    return [];
  }
};

// --- FIRESTORE INHERITANCE REPORTS ---

export const saveInheritanceReportToFirestore = async (uid: string, reportData: any) => {
  try {
    const reportsRef = collection(db, 'users', uid, 'inheritanceReports');
    const id = reportData.id || `report_${Date.now()}`;
    const docData = {
      ...reportData,
      id,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(reportsRef, id), docData, { merge: true });
    return docData;
  } catch (error) {
    console.error("Error saving inheritance report:", error);
    throw error;
  }
};

export const getInheritanceReportsFromFirestore = async (uid: string) => {
  try {
    const reportsRef = collection(db, 'users', uid, 'inheritanceReports');
    const snap = await getDocs(reportsRef);
    return snap.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error getting inheritance reports:", error);
    return [];
  }
};

// --- FIRESTORE GENERATED DOCUMENTS ---

export const saveGeneratedDocumentToFirestore = async (uid: string, docData: any) => {
  try {
    const docsRef = collection(db, 'users', uid, 'generatedDocuments');
    const id = docData.id || `doc_${Date.now()}`;
    const payload = {
      ...docData,
      id,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(docsRef, id), payload, { merge: true });

    // Update count on user profile
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentCount = userSnap.data()?.completedDocsCount || 0;
      await setDoc(userRef, { completedDocsCount: currentCount + 1 }, { merge: true });
    }

    return payload;
  } catch (error) {
    console.error("Error saving generated document:", error);
    throw error;
  }
};

export const getGeneratedDocumentsFromFirestore = async (uid: string) => {
  try {
    const docsRef = collection(db, 'users', uid, 'generatedDocuments');
    const snap = await getDocs(docsRef);
    return snap.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error getting generated documents:", error);
    return [];
  }
};

// --- FIRESTORE DISPUTE RISK ASSESSMENTS ---

export const saveRiskAssessmentToFirestore = async (uid: string, assessmentData: any) => {
  try {
    const riskRef = collection(db, 'users', uid, 'riskAssessments');
    const id = assessmentData.id || `risk_${Date.now()}`;
    const payload = {
      ...assessmentData,
      id,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(riskRef, id), payload, { merge: true });
    return payload;
  } catch (error) {
    console.error("Error saving risk assessment:", error);
    throw error;
  }
};

export const getRiskAssessmentsFromFirestore = async (uid: string) => {
  try {
    const riskRef = collection(db, 'users', uid, 'riskAssessments');
    const snap = await getDocs(riskRef);
    return snap.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error getting risk assessments:", error);
    return [];
  }
};

// --- FIRESTORE FAMILY PEACE SCORES ---

export const savePeaceScoreToFirestore = async (uid: string, peaceScoreData: any) => {
  try {
    const peaceRef = collection(db, 'users', uid, 'peaceScores');
    const id = peaceScoreData.id || `peace_${Date.now()}`;
    const payload = {
      ...peaceScoreData,
      id,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(peaceRef, id), payload, { merge: true });
    return payload;
  } catch (error) {
    console.error("Error saving family peace score:", error);
    throw error;
  }
};

export const getPeaceScoresFromFirestore = async (uid: string) => {
  try {
    const peaceRef = collection(db, 'users', uid, 'peaceScores');
    const snap = await getDocs(peaceRef);
    return snap.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error getting peace scores:", error);
    return [];
  }
};
