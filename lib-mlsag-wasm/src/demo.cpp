
#include <stdio.h>
#include "rctSigs.h"
#include <nlohmann/json.hpp>

void printHex(unsigned const char *c)
{
    for (int i = 0; i < 32; i++)
    {
        printf("%02x", c[i]);
    };
}

int main()
{

    int RING_SIZE = 8;
    int ROWS = 5;
    int DS_ROWS = 3;

    key message;
    skGen(message);

    keyV xtmp = skvGen(ROWS);
    keyM xm = keyMInit(ROWS, RING_SIZE); // = [[None]*N] #just used to generate test public keys
    keyV sk = skvGen(ROWS);
    keyM P = keyMInit(ROWS, RING_SIZE); // = keyM[[None]*N] #stores the public keys;
    int ind = 2;
    int i = 0;
    for (int j = 0; j < ROWS; j++)
    {
        for (i = 0; i < RING_SIZE; i++)
        {
            xm[i][j] = skGen();
            P[i][j] = scalarmultBase(xm[i][j]);
        }
    }
    for (int j = 0; j < ROWS; j++)
    {
        sk[j] = xm[ind][j];
    }

    mgSig IIccss = MLSAG_Gen(message, P, sk, ind, DS_ROWS);

    printf("{\n");
    printf("  \"messageHash\": \"");
    printHex(message.bytes);
    printf("\",\n");

    printf("  \"publicKeys\": [");
    for (i = 0; i < RING_SIZE; i++)
    {

        printf("[");
        for (int j = 0; j < ROWS; j++)
        {
            printf("\"");
            printHex(P[i][j].bytes);
            printf("\"");
            if (j != ROWS - 1)
            {
                printf(",");
            }
        }
        printf("]");
        if (i != RING_SIZE - 1)
        {
            printf(",");
        }
    }
    printf("],\n");

    printf("  \"cc\": \"");
    printHex(IIccss.cc.bytes);
    printf("\",\n");

    printf("  \"II\": [");
    for (int j = 0; j < DS_ROWS; j++)
    {

        printf("\"");
        printHex(IIccss.II[j].bytes);
        printf("\"");
        if (j != DS_ROWS - 1)
        {
            printf(",");
        }
    }
    printf("],\n");

    printf("  \"ss\": [");
    for (i = 0; i < RING_SIZE; i++)

    {
        printf("[");
        for (int j = 0; j < ROWS; j++)
        {
            printf("\"");
            printHex(IIccss.ss[i][j].bytes);
            printf("\"");
            if (j != ROWS - 1)
            {
                printf(",");
            }
        }
        printf("]");
        if (i != RING_SIZE - 1)
        {
            printf(",");
        }
    }
    printf("]\n");

    printf("}\n");

    auto isOk = MLSAG_Ver(message, P, IIccss, DS_ROWS);
    if (!isOk)
    {
        printf("\nERRRORORRORORORORR\n");
        return 100;
    }
    else
    {
        printf("\n\n");
    }

    return 0;
}