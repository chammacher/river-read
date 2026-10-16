import {
  EditNote,
  Verified,
  HistoryEdu,
} from '@material-symbols-svg/react-native';

export interface FieldNote {
  icon: React.ComponentType<{
    width?: number;
    height?: number;
    color?: string;
  }>;
  title: string;
  description: string;
}

export interface FieldNotes {
  emptyNote: FieldNote;
  listNote: FieldNote;
  addNote: FieldNote;
}

export const fieldNotes: FieldNotes = {
  emptyNote: {
    icon: Verified,
    title: 'Note // Municipal Weather Hydrology',
    description: `Why track by town or municipality? Weather stations in valley settlements supply continuous barometric drift and air thermal curves, computing the most dependable hatch and emergence windows on nearby freestones.`,
  },
  listNote: {
    icon: HistoryEdu,
    title: 'Field Register Guide',
    description: `Tap any town station above for local barometric drift, hatch tables, thermal notes, and verified pocket water markers.`,
  },
  addNote: {
    icon: EditNote,
    title: 'Field Calibration Tip',
    description:
      'Municipal weather anchors river telemetry with reliable barometric pressure and diurnal air curves. Add your nearest basecamp or staging town to fine-tune hatch emergence models.',
  },
};
