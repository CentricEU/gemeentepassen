import { commonRoutingConstants } from '@frontend/common';

import { runOAuthComponentTests } from '../../shared/testing/oauth-shared.spec-helper';
import { ApplyForPassComponent } from './apply-for-pass.component';

runOAuthComponentTests(ApplyForPassComponent, commonRoutingConstants.digidCategory);
