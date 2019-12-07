# Welcome to the Everest Flight Sim wiki!

After an Everest Trek in Nepal, I was inspired to emulate the experience I had. 

I came across a Mathematical Model and Simulation for a Helicopter with Tail Rotor here: http://www.wseas.us/e-library/conferences/2010/Merida/CIMMACS/CIMMACS-03.pdf

I then considered how I could recreate Everest and the surrounding landscapes. I looked for a Digital Elevation Model (DEM) but found that the Nepalese government agency wasn't offering it publicly. Undeterred, I learned I could pull latitude, longitude, and elevation CSV data from Google Maps then use arcGIS to create my own DEM.

Using Three.js and some client side Javascript skills I've set out to create this project to the best of my abilities.

# To Load 

Download repo and host on a local server. I use WAMP on mmy Windows machine. Then open Chrome and navigate to the url below.

```
localhost/flight_sim/react/client
```

W/S - Pitch Controls
A/D - Roll Controls
Q/E - Yaw Controls

Up/Down Arrows    - Increase/Decrease RPM Main Rotor
Right/Left Arrows - Increase/Decrease RPM Tail Rotor

# Master

```
Branch: master
```

Game/Simulator I have built to the best of my abilities. Recreating the logic to simulate a helicopter is incredible math and physic intensive. My approach initially is to create a basic more arcade style logic from a basic understanding of vectors, velocity, acceleration, mass, gravity, force, pitch, roll, and yaw. 

![Everest Flight Simulator](https://github.com/mpaccione/everest_flight_sim/blob/master/client/master-preview.jpg?raw=true)

# Flight Debugger Full Simulation

```
Branch: debugger-simulation
```

Complete testing simulator featuring generated terrain, skybox, 3D orientation model, perspective camera, cockpit instrument panel, helicopter audio, and collision detection. All materials are rendered with textures.

COMING SOON!

# Flight Debugger Wireframe Simulation

```
Branch: debugger-wireframe
```

More complete testing simulator featuring generated terrain, 3D orientation model, and perspective camera. All materials are rendered as wireframes.
 
![Flight Debugger Simulation Preview Image](https://github.com/mpaccione/everest_flight_sim/blob/debugger-wireframe/flight-debugger-simulation-preview.png?raw=true)

# Flight Debugger 3D Plane

```
Branch: debugger-plane
```

Basic simulator, featuring debugger stats, a helicopter model, and 3D plane. This was the first debugger I built to create and test the logic/physics for the application.

![Flight Debugger Wireframe Preview Image](https://github.com/mpaccione/everest_flight_sim/blob/debugger-plane/flight-debugger-wireframe-preview.png?raw=true)

```
Branch: debugger-terrain
```

Terrain Grid System. Included is 10km^2 Green Square, each Blue Square is 1km^2 and each Red Square is 0.1km^2. Dynamic picking.

![Flight Debugger Terrain Preview Image](https://github.com/mpaccione/everest_flight_sim/blob/debugger-terrain/flight-debugger-terrain-preview.jpg?raw=true)


# Contribute

If you would like to help with either the visual aspects/performance/math simulations please use the github repo features like normal. Your help is much appreciated.

```
IN CLIENT DIR
watchify app.js -o dist/bundle.js
```

Thank You,
Michael Paccione
Javascript Developer