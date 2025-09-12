import leaflet from 'leaflet';

import Leaflet, { useLeafletStore } from './components/Leaflet/Leaflet';

import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';

export default function App() {
	const map = useLeafletStore((state) => state.map);
	const pointerPos = useLeafletStore((state) => state.pointerPos);
    
	return (
		<div>
			<Leaflet />

			<Tabs defaultValue='marker' className="absolute top-4 right-4 w-75 z-1000">
				<Card className='py-4'>
					<div className='flex justify-center w-full'>
						<TabsList>
							<TabsTrigger value="marker">Markers</TabsTrigger>
							<TabsTrigger value="settings">Settings</TabsTrigger>
						</TabsList>
					</div>
					<TabsContent value="marker">
						<CardHeader className="pb-2">
							<CardTitle>Add marker</CardTitle>
							<CardDescription>Input the coordinates to add a marker</CardDescription>
						</CardHeader>

						<CardContent>
							<form className="flex flex-col gap-4"
								onSubmit={(e) => {
									e.preventDefault();

									const form = e.target as HTMLFormElement;
									const formData = new FormData(form);

									const x = Number(formData.get('x'));
									const z = Number(formData.get('z'));
									const state = String(formData.get('state'));

									if (map) {
										const marker = leaflet.marker([-z, x]).addTo(map);
										marker.bindPopup(`<div><strong>State:</strong> ${state}<br/><strong>Coordinates:</strong> (${x}, ${z})</div>`).openPopup();
										form.reset();
									}
								}}
							>
								<div className="flex gap-4 justify-between items-center">
									<Label htmlFor="x">X</Label>
									<Input name="x" id="x" type="number" defaultValue={0} step={0.001}/>
								</div>
								<div className="flex gap-4 justify-between items-center">
									<Label htmlFor="z">Z</Label>
									<Input name="z" id="z" type="number" defaultValue={0} step={0.001}/>
								</div>
								<div className="flex gap-4 justify-between items-center">
									<Label htmlFor="state">State</Label>
									<Input name="state" id="state" type="text" defaultValue="Example state" />
								</div>

								<CardAction className="self-end">
									<Button type="submit">Add</Button>
								</CardAction>
							</form>
						</CardContent>
					</TabsContent>
				</Card>
			</Tabs>

			<Card className='absolute bottom-4 left-4 w-50 z-1000'>
				<CardContent>
					<div className='flex flex-col gap-2'>
						<div className='flex justify-between flex-col'>
							<span className='font-bold'>Pointer:</span>
							<span className='flex ml-2 justify-between'><b>X:</b> {pointerPos?.x}</span>
							<span className='flex ml-2 justify-between'><b>Z:</b> {pointerPos?.z}</span>
						</div>
						<div className='flex justify-between'>
							<span className='font-bold'>Zoom:</span>
							<span>{map?.getZoom()}</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
