import React from 'react';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import Fade from '@material-ui/core/Fade';
import Slide from '@material-ui/core/Slide';
import Grow from '@material-ui/core/Grow';

export default function AlertMessage({open, message, severity, onClose}) {


  return (
    <div>
      {/* <Button onClick={handleClick(GrowTransition)}>Grow Transition</Button>
      <Button onClick={handleClick(Fade)}>Fade Transition</Button>
      <Button onClick={handleClick(SlideTransition)}>Slide Transition</Button> */}
      <Snackbar
        open={open}
        onClose={onClose}
        // TransitionComponent={Fade}
        message={message}
        severity={severity}
        autoHideDuration = "5000"
        // key={state.Transition.name}
      />
    </div>
  );
}

// function SlideTransition(props) {
//   return <Slide {...props} direction="up" />;
// }

// function GrowTransition(props) {
//   return <Grow {...props} />;
// }

//   const [state, setState] = React.useState({
//     open: false,
//     Transition: Fade,
//   });

//   const handleClick = (Transition) => () => {
//     setState({
//       open: true,
//       Transition,
//     });
//   };

//   const handleClose = () => {
//     setState({
//       ...state,
//       open: false,
//     });
//   };
