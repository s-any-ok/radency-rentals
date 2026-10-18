import { FormProvider } from 'react-hook-form';
import { View } from 'react-native';

import {
  ApplicantInfoSection,
  ApplicationSummary,
  ResidenceHistorySection,
} from 'src/features/application-form';
import type { ApplicationDto } from 'src/entities/application';
import { Banner, Button, Card, Text } from 'src/shared/ui';

import { useApplicationWizard } from '../model/useApplicationWizard';
import { WizardStepper } from './WizardStepper';

type Props = { application: ApplicationDto };

/**
 * The application page: one form, one section at a time. Each section renders through its own
 * component, editable or read-only depending on the server's isEditable decision.
 */
export const ApplicationWizard = ({ application }: Props) => {
  const { form, step, stepIndex, readOnly, busy, formError, notice, goNext, goBack, goTo, submit } =
    useApplicationWizard(application);

  const isFirst = stepIndex === 0;
  const isSummary = step.key === 'Summary';

  return (
    <FormProvider {...form}>
      <WizardStepper
        application={application}
        stepIndex={stepIndex}
        onSelect={goTo}
      />

      <View className="gap-3 px-4">
        {formError ? (
          <Banner
            tone="danger"
            icon="alert-circle"
            message={formError}
          />
        ) : null}
        {notice ? (
          <Banner
            tone="warning"
            icon="cloud-offline-outline"
            message={notice}
          />
        ) : null}

        {isSummary ? (
          <ApplicationSummary application={application} />
        ) : (
          <Card>
            <Text
              variant="heading"
              className="mb-3"
            >
              {step.key === 'ApplicantInformation' ? 'Applicant information' : 'Residence history'}
            </Text>
            {step.key === 'ApplicantInformation' ? (
              <ApplicantInfoSection readOnly={readOnly} />
            ) : (
              <ResidenceHistorySection readOnly={readOnly} />
            )}
          </Card>
        )}

        {isSummary && !readOnly && !application.canSubmit ? (
          <Banner
            tone="neutral"
            message="Save both sections to submit the application."
          />
        ) : null}

        <View className="flex-row gap-3 pt-1">
          {!isFirst && (
            <Button
              title="Back"
              variant="secondary"
              icon="arrow-back"
              onPress={goBack}
              disabled={busy}
              className="flex-1"
            />
          )}
          {isSummary ? (
            !readOnly && (
              <Button
                title="Submit"
                icon="send"
                onPress={submit}
                loading={busy}
                disabled={!application.canSubmit}
                className="flex-1"
              />
            )
          ) : (
            <Button
              title={readOnly ? 'Next' : 'Continue'}
              icon={readOnly ? undefined : 'save-outline'}
              onPress={goNext}
              loading={busy}
              className="flex-1"
            />
          )}
        </View>
      </View>
    </FormProvider>
  );
};
