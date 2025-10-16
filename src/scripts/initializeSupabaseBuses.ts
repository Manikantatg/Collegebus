import { createClient } from '@supabase/supabase-js';
import { busRoutes } from '../data/busRoutes';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function initializeBuses() {
  console.log('Starting bus data initialization...');

  for (const busIdStr of Object.keys(busRoutes)) {
    const busId = parseInt(busIdStr);
    const route = busRoutes[busId];

    console.log(`Initializing Bus #${busId}...`);

    const { data: existingBus, error: busCheckError } = await supabase
      .from('buses')
      .select('id')
      .eq('id', busId)
      .maybeSingle();

    if (busCheckError) {
      console.error(`Error checking bus ${busId}:`, busCheckError);
      continue;
    }

    if (!existingBus) {
      const { error: busError } = await supabase
        .from('buses')
        .insert({
          id: busId,
          current_stop_index: 0,
          eta: null,
          current_driver_email: null,
          current_driver_name: null,
          total_distance: 0
        });

      if (busError) {
        console.error(`Error creating bus ${busId}:`, busError);
        continue;
      }
      console.log(`✓ Created bus ${busId}`);
    } else {
      console.log(`✓ Bus ${busId} already exists`);
    }

    const { data: existingStops } = await supabase
      .from('bus_stops')
      .select('stop_index')
      .eq('bus_id', busId);

    if (!existingStops || existingStops.length === 0) {
      const stops = route.map((stop, index) => ({
        bus_id: busId,
        stop_index: index,
        name: stop.name,
        scheduled_time: stop.scheduledTime,
        completed: false,
        actual_time: null
      }));

      const { error: stopsError } = await supabase
        .from('bus_stops')
        .insert(stops);

      if (stopsError) {
        console.error(`Error creating stops for bus ${busId}:`, stopsError);
        continue;
      }
      console.log(`✓ Created ${stops.length} stops for bus ${busId}`);
    } else {
      console.log(`✓ Stops for bus ${busId} already exist`);
    }
  }

  console.log('Bus data initialization completed!');
}

initializeBuses().catch(console.error);
