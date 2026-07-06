import { Typography } from '@mui/material';

const CustomTextFieldTitle = ({
  children,
  fontSize = 18,
  fontWeight = 600,
  color = 'text.primary',
  fontFamily = "'Montserrat', sans-serif",
  transition = 'opacity 180ms ease, transform 180ms ease',
  height = 16,
  pointerEvents = 'none',
}) => {
  return (
    <Typography
      sx={{
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color,
        fontFamily: fontFamily,
        transition: transition,
        height: height,
        pointerEvents: pointerEvents,
      }}
    >
      {children}
    </Typography>
  );
};

export default CustomTextFieldTitle;
