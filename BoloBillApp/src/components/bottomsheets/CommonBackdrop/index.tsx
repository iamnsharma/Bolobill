import React from 'react';
import {BottomSheetBackdrop, BottomSheetBackdropProps} from '@gorhom/bottom-sheet';

export const CommonBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
);
