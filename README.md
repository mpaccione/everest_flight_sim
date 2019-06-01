# Welcome to the Everest Flight Sim wiki!

After an Everest Trek in Nepal, I was inspired to emulate the experience I had. 

I came across a Mathematical Model and Simulation for a Helicopter with Tail Rotor here: http://www.wseas.us/e-library/conferences/2010/Merida/CIMMACS/CIMMACS-03.pdf

I then considered how I could recreate Everest and the surrounding landscapes. I looked for a Digital Elevation Model (DEM) but found that the Nepalese government agency wasn't offering it publicly. Undeterred, I learned I could pull latitude, longitude, and elevation CSV data from Google Maps then use arcGIS to create my own DEM.

Using Three.js and some client side Javascript skills I've set out to create this project to the best of my abilities.

# Master

```
Branch: master
```

Game/Simulator I have built to the best of my abilities. Recreating the logic to simulate a helicopter is incredible math and physic intensive. My initial approach is to create a basic more arcade style logic from a basic understanding of vectors, velocity, acceleration, mass, gravity, force, pitch, roll, and yaw. Looks like those high school physics classes paid off :)

![Flight Debugger Wireframe Preview Image](https://github.com/mpaccione/everest_flight_sim/blob/flight-debugger-wireframe/master-preview.jpg?raw=true)

# Flight Debugger Simulation

```
Branch: flight-debugger-simulation
```

More complete testing simulator featuring generated terrain, 3D orientation model, and perspective camera.
 
![Flight Debugger Simulation Preview Image](https://github.com/mpaccione/everest_flight_sim/blob/flight-debugger-simulation/flight-debugger-simulation-preview.png?raw=true)

# Flight Debugger Wireframe

```
Branch: flight-debugger-wireframe
```

Basic wireframe simulator I built to create and test the logic/physics for the application.

![Flight Debugger Wireframe Preview Image](https://github.com/mpaccione/everest_flight_sim/blob/flight-debugger-wireframe/flight-debugger-wireframe-preview.png?raw=true)

# Contribute

If you would like to help with either the visual aspects/performance/math simulations please use the github repo features like normal. Your help is much appreciated.

```
watchify app.js -o dist/bundle.js
```

Thank You,
Michael Paccione
Javascript Developer
