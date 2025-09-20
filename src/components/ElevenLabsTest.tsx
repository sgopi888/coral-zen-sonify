import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '@/integrations/supabase/client';

export const ElevenLabsTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      console.log('Running ElevenLabs API test...');
      
      const { data, error } = await supabase.functions.invoke('elevenlabs-test');

      if (error) {
        console.error('Test error:', error);
        setResult({
          success: false,
          error: error.message,
          details: error
        });
      } else {
        console.log('Test result:', data);
        setResult(data);
      }
    } catch (error) {
      console.error('Test failed:', error);
      setResult({
        success: false,
        error: error.message || 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>ElevenLabs API Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTest}
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Testing...' : 'Test ElevenLabs API'}
        </Button>

        {result && (
          <Alert className={result.success ? 'border-green-500' : 'border-red-500'}>
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-semibold">
                  {result.success ? '✅ Success' : '❌ Failed'}
                </div>
                
                {result.error && (
                  <div className="text-red-600">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}

                {result.message && (
                  <div>
                    <strong>Message:</strong> {result.message}
                  </div>
                )}

                {result.status && (
                  <div>
                    <strong>HTTP Status:</strong> {result.status}
                  </div>
                )}

                {result.details && (
                  <div className="text-sm bg-gray-100 p-2 rounded mt-2">
                    <strong>Details:</strong>
                    <pre className="whitespace-pre-wrap text-xs">
                      {typeof result.details === 'string' 
                        ? result.details 
                        : JSON.stringify(result.details, null, 2)
                      }
                    </pre>
                  </div>
                )}

                {result.data && (
                  <div className="text-sm bg-blue-50 p-2 rounded mt-2">
                    <strong>Response Data:</strong>
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}

                {result.responseType && (
                  <div>
                    <strong>Response Type:</strong> {result.responseType}
                  </div>
                )}

                {result.audioSize && (
                  <div>
                    <strong>Audio Size:</strong> {result.audioSize} bytes
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};