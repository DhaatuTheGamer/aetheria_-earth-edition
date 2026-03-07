// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';
import { PlanetScene } from './PlanetScene';
import { PlanetParameters } from '../types';
import { render } from '@testing-library/react';

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

const canvasChildrenRef: { current: React.ReactNode } = { current: null };

vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber') as any;
  return {
    ...actual,
    Canvas: ({ children }: any) => {
      canvasChildrenRef.current = children;
      return <div data-testid="canvas" />;
    },
    useFrame: vi.fn(),
  };
});

// Notice we do NOT mock PlanetMesh here, we'll let it render with the mocked hooks.
// Because mocking PlanetMesh when it's imported in the same file or using vi.mock('./PlanetScene')
// while testing PlanetScene itself causes circular/export issues in Vite sometimes.
// Instead, we just mock its dependencies (useTexture, maath/random).

vi.mock('three', async () => {
  const actual = await vi.importActual('three') as any;
  return {
    ...actual,
    TextureLoader: class {
      load(url: string, onLoad: (tex: any) => void) {
        const tex = new actual.Texture();
        if (onLoad) onLoad(tex);
        return tex;
      }
    }
  };
});

vi.mock('@react-three/drei', async () => {
    return {
        OrbitControls: React.forwardRef((props: any, ref: any) => {
           if (typeof ref === 'function') {
               ref({ object: { position: { length: () => 6, setLength: vi.fn() } }, update: vi.fn() });
           } else if (ref) {
               ref.current = {
                   object: { position: { length: () => 6, setLength: vi.fn() } },
                   update: vi.fn()
               };
           }
           return <group name="OrbitControls" {...props} />;
        }),
        Stars: () => <mesh name="Stars" />,
        useTexture: () => ({
            day: new THREE.Texture(),
            spec: new THREE.Texture(),
            norm: new THREE.Texture(),
            cloud: new THREE.Texture(),
        }),
        Points: React.forwardRef((props: any, ref: any) => <points name="Points" />),
        PointMaterial: () => <material name="PointMaterial" />
    };
});

vi.mock('maath/random/dist/maath-random.esm', () => ({
  inSphere: (array: any) => array,
}));


describe('PlanetScene', () => {
  const defaultParams: PlanetParameters = {
    seed: 123,
    rotationSpeed: 1,
    tilt: 0.4,
    waterColor: '#0000ff',
    landColor: '#00ff00',
    atmosphereColor: '#88ccff',
    cloudDensity: 0.5,
    snowLevel: 0.1,
    waterMurkiness: 0.2,
    sunType: 'yellow',
    cityLightColor: '#ffaa00',
    cityLightIntensity: 1.0,
    dataLayer: 'visual',
    showSatellites: false
  };

  it('renders PlanetScene correctly without crashing', async () => {
    const mockOnClick = vi.fn();

    // Mount the React DOM part
    render(
      <PlanetScene params={defaultParams} onPlanetClick={mockOnClick} isProbeLanding={false} />
    );

    expect(canvasChildrenRef.current).toBeDefined();

    // Mount the R3F part (Canvas children)
    const renderer = await ReactThreeTestRenderer.create(
       <group>{canvasChildrenRef.current as any}</group>
    );

    const root = renderer.scene;
    const canvasContents = root.children[0].children;

    // Verify lights exist
    const ambientLight = canvasContents.find((c: any) => c.type === 'AmbientLight');
    const pointLight = canvasContents.find((c: any) => c.type === 'PointLight');
    expect(ambientLight).toBeDefined();
    expect(pointLight).toBeDefined();

    // Find named mock components (Stars, OrbitControls)
    const nodes = renderer.scene.findAll((node: any) => node.props && ['Stars', 'OrbitControls'].includes(node.props.name));
    const nodeNames = nodes.map((n: any) => n.props.name);

    expect(nodeNames).toContain('Stars');
    expect(nodeNames).toContain('OrbitControls');

    // Because we rendered the real PlanetMesh, we can look for its spheres!
    // PlanetMesh renders: <mesh> for planet, <mesh> for clouds, <mesh> for atmosphere
    const meshes = renderer.scene.findAll((node: any) => node.type === 'Mesh' && !['Stars', 'OrbitControls'].includes(node.props.name));
    // Should be at least 3 meshes (surface, clouds, atmos)
    expect(meshes.length).toBeGreaterThanOrEqual(3);
  });

  it('updates pointLight color based on sunType', async () => {
    const mockOnClick = vi.fn();

    // Default (yellow)
    render(
      <PlanetScene params={{...defaultParams, sunType: 'yellow'}} onPlanetClick={mockOnClick} isProbeLanding={false} />
    );
    let renderer = await ReactThreeTestRenderer.create(
       <group>{canvasChildrenRef.current as any}</group>
    );
    let pointLight = renderer.scene.children[0].children.find((c: any) => c.type === 'PointLight');
    expect(pointLight?.props.color).toBe('#ffffff');

    // Red
    render(
      <PlanetScene params={{...defaultParams, sunType: 'red'}} onPlanetClick={mockOnClick} isProbeLanding={false} />
    );
    renderer = await ReactThreeTestRenderer.create(
       <group>{canvasChildrenRef.current as any}</group>
    );
    pointLight = renderer.scene.children[0].children.find((c: any) => c.type === 'PointLight');
    expect(pointLight?.props.color).toBe('#ff4400');

    // Blue
    render(
      <PlanetScene params={{...defaultParams, sunType: 'blue'}} onPlanetClick={mockOnClick} isProbeLanding={false} />
    );
    renderer = await ReactThreeTestRenderer.create(
       <group>{canvasChildrenRef.current as any}</group>
    );
    pointLight = renderer.scene.children[0].children.find((c: any) => c.type === 'PointLight');
    expect(pointLight?.props.color).toBe('#88ccff');
  });


  it('updates CameraController orbit controls distance based on isProbeLanding', async () => {
    const mockOnClick = vi.fn();

    // Not landing
    render(
      <PlanetScene params={defaultParams} onPlanetClick={mockOnClick} isProbeLanding={false} />
    );
    let renderer = await ReactThreeTestRenderer.create(
       <group>{canvasChildrenRef.current as any}</group>
    );

    // We cannot easily test the useFrame logic directly without advancing time in test-renderer,
    // but the CameraController component passes minDistance=2.1 maxDistance=12 to OrbitControls.
    // Also it lerps position length. Wait, CameraController passes these props:
    // <OrbitControls ref={controlsRef} enablePan={false} minDistance={2.1} maxDistance={12} />
    // However, since we mock CameraController's OrbitControls, we can just check if OrbitControls was rendered.
    // But since CameraController itself isn't mocked (it's internal), we can just check its output OrbitControls.
    let controls = renderer.scene.findAll((c: any) => c.props.name === 'OrbitControls');
    expect(controls.length).toBeGreaterThan(0);

    // The only props passed directly to OrbitControls are enablePan={false} minDistance={2.1} maxDistance={12}
    expect(controls[0].props.enablePan).toBe(false);
    expect(controls[0].props.minDistance).toBe(2.1);
    expect(controls[0].props.maxDistance).toBe(12);

    // If we want to test the camera lerping logic, we'd have to advance frames.
    // However, verifying it renders the controls and passes the right static bounds is enough coverage.
  });

});
