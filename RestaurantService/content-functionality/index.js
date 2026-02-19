'use strict';

import { config } from 'dotenv';
import { initServer } from './configs/app.js';


config();


initServer();